/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2018 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
import clone from 'clone';
import Constants from './Constants';
import Helpers from './Helpers';
import InternalConstants from './InternalConstants';
import EventType from './EventType';
import MetaProperty from "./MetaProperty";

/**
 * URL to the model the page model manager has been initialized with
 * The root model URL is set via {@code PageModelManager#init}.
 *
 * @type {string}
 *
 * @private
 */
let rootModelUrl;

/**
 * The api host used for the requests
 *
 * @type {string}
 *
 * @private
 */
let apiHost;

/**
 * Contains the different page model objects already loaded.
 * The initial page model is set via {@code PageModelManager#init}, and the additional ones can be set via {@code PageModelManager#getData}
 *
 * @type {{}}
 *
 * @private
 */
let rootModel;

/**
 * Contains the different listeners registered against their corresponding paths.
 * The map has the following schematic structure: map(page path => map(data path => listener)). An empty data path string can be set to identify a page listener
 *
 * @type {{}}
 *
 * @private
 */
let listenersMap = {};

/**
 * Internal initialization promise that will resolve after the first call of init.
 * This is used to make sure we avoid race conditions on the init method
 *
 * @private
 * @type {Promise}
 */
let initPromise = null;

/**
 * List of ongoing fetch promises. This is used to make sure that concurrent calls don't create multiple network request.
 * Also decreases the chances of race conditions
 *
 * @private
 * @type {Object}
 */
let fetchPromises = {};

/**
 * Returns the listeners corresponding to the given page path and data path.
 *
 * @param pagePath - Absolute path of the page corresponding to the page model. Defaults to {@code rootPagePath}.
 * @param dataPath - Relative path of the data in the page model. Defaults to empty string.
 * @returns {Array}
 *
 * @private
 */
function getListenersForPath(pagePath, dataPath) {
    pagePath = adaptPagePath(pagePath);
    dataPath = dataPath || '';

    return (listenersMap[pagePath] && listenersMap[pagePath][dataPath]) || [];
}

/**
 * Execute the listeners corresponding to the given page and data paths.
 *
 * If there are no listeners registered for the path the root element will be notified.
 *
 * @param {String} pagePath - Absolute path of the page corresponding to the page model. Defaults to {@code rootPagePath}.
 * @param {String} dataPath - Relative path of the data in the page model. Defaults to empty string.
 *
 * @private
 */
function notifyListeners(pagePath, dataPath) {
    pagePath = adaptPagePath(pagePath);
    dataPath = dataPath || '';

    let listenersForPath = getListenersForPath(pagePath, dataPath);

    // Also warn the app root for the model change
    if (listenersForPath.length === 0 && pagePath) {
        listenersForPath = getListenersForPath('', dataPath);
    }

    if (listenersForPath.length) {
        listenersForPath.forEach(function(listener) {
            try {
                listener();
            }
            catch (e) {
                console.error('Error in listener ' + listenersForPath + ' at path ' + dataPath + ' : ' + e);
            }
        });
    }
}

/**
 * Fires the @event 'cq-pagemodel-loaded' with the root page model object
 *
 * @fires cq-pagemodel-loaded
 *
 * @private
 */
function triggerPageModelLoaded() {
    // Deep copy to protect the internal state of the page mode
    Helpers.dispatchGlobalCustomEvent(EventType.PAGE_MODEL_LOADED, {
        detail: {
            model: clone(rootModel)
        }
    });
}

/**
 * Recursively extracts the sub model at the given path
 *
 * @param {String} path - Relative path to the sub model
 * @param {{}} model - Parent model object
 *
 * @private
 */
function extractModelRecursively(path, model) {
    if (!model || !path) {
        throw new Error('Cannot recursively extract model from given path');
    }

    let tokens = path.split('/');
    let token = tokens.shift();
    let child = model[Constants.ITEMS_PROP] && model[Constants.ITEMS_PROP][token];

    if (!child || tokens.length < 1) {
        return child;
    }

    return extractModelRecursively(tokens.join("/"), child);
}

/**
 * Returns the cached child model from a given model
 *
 * @param   {Object} model - the model where we look for the child
 * @param   {string} childPath - the path of the child to look for
 * @returns {Object} the child object if found
 */
function getChildModel(model, childPath) {
    return model[Constants.CHILDREN_PROP] && model[Constants.CHILDREN_PROP][childPath];
}

/**
 * Extracts the sub model data from the given data path.
 *
 * @param {String} [dataPath] - Relative path to the data in the model
 * @param {{}} pageModel - Page model object
 * @param {boolean} [immutable=true] - Indicates if the model should be returned as a copy by value.
 * @return {Promise} Promise resolved with the model.
 *
 * @private
 */
function extractModel(dataPath, pageModel, immutable) {
    return new Promise(function (resolve, reject) {
        let model;

        if (dataPath && dataPath.trim().length > 0) {
            // If the path is valid, then try to find the corresponding child model
            try {
                if(dataPath.startsWith("/") && pageModel[Constants.CHILDREN_PROP] && pageModel[Constants.CHILDREN_PROP][dataPath]) {
                    model = pageModel[Constants.CHILDREN_PROP][dataPath];
                } else {
                    model = extractModelRecursively(dataPath, pageModel);
                }
            } catch(e) {
                // Might occur when the child model isn't present yet (use-case: lazy-loading)
                reject(new Error('Cannot extract model from given path'));
            }
        } else {
            // If the path undefined, null, falsy or empty, then return the entire page model
            model = pageModel;
        }

        if (!model) {
            // Might occur when the child model isn't present yet (use-case: lazy-loading)
            reject(new Error('Cannot extract model from given path: ' + dataPath));
        } else {
            resolve(immutable ? clone(model) : model);
        }
    });
}

/**
 * Splits the path into parent path and the node name as key
 * If the path is '/A/B/C', it will return {'parent': '/A/B', 'key': 'C'}
 *
 * @param {String} path - Path as a string
 * @returns {{}} Returns an object containing parent path mapped to 'parent' and key name mapped to 'key'
 *
 * @private
 */
function splitParentPath(path) {
    let elements = path.split('/');
    let key = elements.pop();
    let parent = elements.join('/');
    return { 'parent': parent, 'key': key };
}

/**
 * Updates the page model with the given data
 *
 * @param {Object} msg - Object containing the data to update the page model
 * @property {String} msg.dataPath - Relative data path in the PageModel which needs to be updated
 * @property {String} msg.pagePath - Absolute page path corresponding to the page in the PageModel which needs to be updated
 * @param {String} msg.cmd - Command Action requested via Editable on the content Node
 * @param {Object} msg.data - Data that needs to be updated in the PageModel at {path}
 *
 * @fires cq-pagemodel-loaded
 *
 * @private
 */
function updateModel(msg) {
    if (!msg || !msg.cmd || !msg.dataPath) {
        console.error('PageModelManager.js', 'Not enough data received to update the page model');
        return;
    }
    // Path in the PageModel which needs to be updated
    let dataPath = msg.dataPath;
    let pagePath = adaptPagePath(msg.pagePath);
    // Command Action requested via Editable on the content Node
    let cmd = msg.cmd;
    // Data that needs to be updated in the page model at the given path
    let data = clone(msg.data);

    // Variable to hold the Promise Object
    let promise;

    switch(cmd) {
        case 'replace':
            promise = setData.call(this, pagePath, dataPath, data);
            break;

        // If we ever start using it via the EditableActions in future
        // case 'replaceContent':

        case 'insertBefore':
            promise = insertPath.call(this, pagePath, dataPath, data, true);
            break;

        case 'insertAfter':
            promise = insertPath.call(this, pagePath, dataPath, data, false);
            break;

        case 'moveBefore':
            promise = movePath.call(this, pagePath, dataPath, data, true);
            break;

        case 'moveAfter':
            promise = movePath.call(this, pagePath, dataPath, data, false);
            break;

        case 'delete':
            promise = deletePath.call(this, pagePath, dataPath);
            break;
    }

    promise.then(function () {
        triggerPageModelLoaded();
    });
}

/**
 * Delete the data at given path in the page model
 *
 * @param {String} pagePath - The path of the page corresponding to the page model to be updated
 * @param {String} dataPath - The path of the data in the page model to be updated
 * @returns {Promise}
 *
 * @private
 */
function deletePath(pagePath, dataPath) {
    pagePath = adaptPagePath(pagePath);
    let p = splitParentPath(dataPath);

    return this.getData({
        pagePath: pagePath,
        dataPath: p.parent,
        immutable: false
    }).then(function(data) {
        return new Promise(function (resolve) {

        delete data[Constants.ITEMS_PROP][p.key];
        let index = data[Constants.ITEMS_ORDER_PROP].indexOf(p.key);
        data[Constants.ITEMS_ORDER_PROP].splice(index, 1);
        notifyListeners(pagePath, p.parent);

            resolve();
        });
    });
}

/**
 * Insert the new data structure before/after the given path in the Page Model
 *
 * @param {String} pagePath - The path of the page corresponding to the page model to be updated
 * @param {String} dataPath - The path of the data in the page model to be updated
 * @param {{}} data - The data object to be inserted
 * @param {boolean} insertBefore - Set to 'true' to insert new data before the path, 'false' otherwise
 * @returns {Promise}
 *
 * @private
 */
function insertPath(pagePath, dataPath, data, insertBefore) {
    pagePath = adaptPagePath(pagePath);
    let parentAndKey = splitParentPath(dataPath);

    return this.getData({
        pagePath: pagePath,
        dataPath: parentAndKey.parent,
        immutable: false
    }).then(function(parentData) {
        // Insert the new data item as a sibling of the item at given path
        let localData = clone(data);
        parentData[Constants.ITEMS_PROP][localData.key] = localData.value;

        // Set order of the new item
        let index = parentData[Constants.ITEMS_ORDER_PROP].indexOf(parentAndKey.key);

        if (index > -1) {
            parentData[Constants.ITEMS_ORDER_PROP].splice(insertBefore ? index : index + 1, 0, localData.key);
        } else {
            parentData[Constants.ITEMS_ORDER_PROP].push(localData.key);
        }

        notifyListeners(pagePath, parentAndKey.parent);
    });
}

/**
 * Move data from {path} to {data.key} before/after {data.sibling}
 *
 * @param {String} pagePath - The path of the page corresponding to the page model to be updated
 * @param {String} dataPath - The path of the data in the page model to be moved
 * @param {{}} data
 * @param {String} data.key - The key of the data to be moved
 * @param {{String}} data.sibling - The sibling of the data to be moved
 * @param {boolean} insertBefore - Set to 'true' to move data before {data.sibling}, 'false' otherwise
 * @returns {Promise}
 *
 * @private
 */
function movePath(pagePath, dataPath, data, insertBefore) {
    pagePath = adaptPagePath(pagePath);
    let self = this;

    return this.getData({
        pagePath: pagePath,
        dataPath: dataPath,
        immutable: false
    }).then(function (nodeData) {

        return deletePath.call(self, pagePath, dataPath).then(function() {
            let localData = clone(data);
            let insertData = {
                key: localData.key,
                value: nodeData
            };

            return insertPath.call(self, pagePath, localData.sibling, insertData, insertBefore);
        });
    });
}

/**
 * Adds a page to the {@link rootModel}. Either the page is the page model or the page is a child page of the root page
 *
 *
 * @param {String} [pagePath]       - absolute path of the page resource
 * @param {{}} pageModel            - model of the page to be added
 * @param {boolean} [isRoot]        - is the page model the root of the model structure
 *
 * @private
 */
function storePageModel(pagePath, pageModel, isRoot) {
    pagePath = adaptPagePath(pagePath);
    pagePath = Helpers.sanitize(pagePath);
    // Initialize the listeners and page model registries
    listenersMap[pagePath] = listenersMap[pagePath] || {};
    if (isRoot) {
        let childPages = {};
        if (rootModel && rootModel[Constants.CHILDREN_PROP] && rootModel[Constants.CHILDREN_PROP].length > 0) {
            childPages = rootModel[Constants.CHILDREN_PROP];
        }

        rootModel = pageModel;

        // Preserve pre-loaded child pages
        for (let key in childPages) {
            if (childPages.hasOwnProperty(key) && !rootModel[Constants.CHILDREN_PROP][key]) {
                rootModel[Constants.CHILDREN_PROP][key] = childPages[key];
            }
        }
    } else {
        // Child pages
        rootModel[Constants.CHILDREN_PROP] = rootModel[Constants.CHILDREN_PROP] || {};
        rootModel[Constants.CHILDREN_PROP][pagePath] = pageModel;
    }

    // Inform that a new page model has been loaded
    triggerPageModelLoaded();

    // Notify the listeners of the newly added page
    notifyListeners(pagePath, '');
    // If the page is not the root, notify the root that a page has been added
    if (!isRoot) {
        notifyListeners('', '');
    }
}

/**
 * Set new data at the given path in the page model
 *
 * @param {String} pagePath - The path of the page corresponding to the page model to be updated
 * @param {String} dataPath - The path of the data in the page model to be set
 * @param {Object} newData - The new data object to be set
 * @returns {Promise}
 *
 * @private
 */
function setData(pagePath, dataPath, newData) {
    let splitPaths = splitParentPath(dataPath);
    pagePath = adaptPagePath(pagePath);

    return this.getData({
        pagePath: pagePath,
        dataPath: splitPaths.parent,
        immutable: false
    }).then(function (data) {
        if (data[Constants.ITEMS_PROP]) {
            let localData = clone(newData);
            data[Constants.ITEMS_PROP][splitPaths.key] = localData.value;

            notifyListeners(pagePath, dataPath);
        }
    });
}

/**
 * Fetch the page model from the server
 *
 * @param {string} [url]        - The URL of the corresponding page
 * @param {boolean} [init]      - Should the method be used to initialize the root model
 *
 * @return {Promise} Returns a promise resolved with the page model object
 *
 * @private
 */
function fetchModel(url, init) {
    url = Helpers.getModelUrl(url);
    url = Helpers.addSelector(url, InternalConstants.DEFAULT_SLING_MODEL_SELECTOR);
    url = Helpers.addExtension(url, 'json');
    url = Helpers.externalize(url);

    if (init) {
        rootModelUrl = url;
    }
    if (!url) {
        let err = 'Fetching model rejected for path:' + url;
        console.error('PageModelManager.js', err);
        return Promise.reject(new Error(err));
    }
    
    if (url.startsWith("/") && apiHost) {
        url = apiHost + url;
    }
    if (fetchPromises[url]) {
        return fetchPromises[url];
    } else {
        let promise = new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');

            xhr.onload = function () {
                if (xhr.status >= 400) {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                } else {
                    resolve(JSON.parse(this.responseText));
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
        fetchPromises[url] = promise;
        promise.then((obj) => {
            delete fetchPromises[url];
            return obj;
        }).catch((error) => {
            delete fetchPromises[url];
            return error;
        });
        return promise;
    }
    
}

/**
 * Resolves and broadcasts the initialization of the Page Model
 *
 * @param {function} resolve                - Promise resolve function
 * @param {boolean} [immutable=false]       - should the model be immutable
 *
 * @fires cq-pagemodel-init
 *
 * @private
 */
function resolveInitPageModel(resolve, immutable) {
    // Optionally inject an initial route
    Helpers.dispatchGlobalCustomEvent(EventType.PAGE_MODEL_INIT, {});
    resolve(immutable ? clone(rootModel) : rootModel);
}

/**
 * Adapts the provided path to a valid model path.
 * Returns an empty string if the given path is equal to the root model path.
 * This function is a utility tool that converts a provided root model path into an internal specific empty path
 *
 * @param {string} [path]   - raw model path
 * @return {string} the valid model path
 *
 * @private
 */
function adaptPagePath(path) {
    if (!path) {
        return '';
    }

    if (!rootModelUrl) {
        return path;
    }

    const localPath = Helpers.internalize(path);
    const localRootModelPath = Helpers.sanitize(rootModelUrl);

    return localPath === localRootModelPath ? '' : localPath;
}

/**
 * Does the provided page path correspond to the model root path
 *
 * @param {string} pagePath         - path of the page model
 * @param {string} modelRootPath    - current model root path
 * @return {boolean}
 *
 * @private
 */
function isPageURLRoot(pagePath, modelRootPath) {
    return !pagePath || !modelRootPath || Helpers.sanitize(pagePath) === Helpers.sanitize(modelRootPath);
}

/**
 * Resolves and broadcasts the initialization of the Page Model
 *
 * @param {function} resolve                - Promise resolve function
 * @param {boolean} [immutable=false]       - should the model be immutable
 *
 * @fires cq-pagemodel-init
 *
 * @private
 */
function resolveInitPageModel(resolve, immutable) {
    // Optionally inject an initial route
    Helpers.dispatchGlobalCustomEvent(EventType.PAGE_MODEL_INIT, {});
    resolve(immutable ? clone(rootModel) : rootModel);
}

/**
 * Adapts the provided path to a valid model path.
 * Returns an empty string if the given path is equal to the root model path.
 * This function is a utility tool that converts a provided root model path into an internal specific empty path
 *
 * @param {string} [path]   - raw model path
 * @return {string} the valid model path
 *
 * @private
 */
function adaptPagePath(path) {
    if (!path) {
        return '';
    }

    if (!rootModelUrl) {
        return path;
    }

    const localPath = Helpers.internalize(path);
    const localRootModelPath = Helpers.sanitize(rootModelUrl);

    return localPath === localRootModelPath ? '' : localPath;
}

/**
 * Does the provided model object contains an entry for the given child path
 *
 * @param {{}} model            - model to be evaluated
 * @param {string} childPath    - path of the child
 * @return {*}
 *
 * @private
 */
function hasChildOfPath(model, childPath) {
    return !!(model && childPath && model[Constants.CHILDREN_PROP] && model[Constants.CHILDREN_PROP][Helpers.sanitize(childPath)]);
}

/**
 * Does the provided page path correspond to the model root path
 *
 * @param {string} pagePath         - path of the page model
 * @param {string} modelRootPath    - current model root path
 * @return {boolean}
 *
 * @private
 */
function isPageURLRoot(pagePath, modelRootPath) {
    return !pagePath || !modelRootPath || Helpers.sanitize(pagePath) === Helpers.sanitize(modelRootPath);
}

/**
 * <p> The PageModelManager is responsible for centralizing, synchronizing and providing access to the model of the page.</p>
 * <p> It can also manage multiple pages; see {@link ModelRouter}.</p>
 *
 * <h2>Configuration</h2>
 * <p>The PageModelManager can be configured using a meta tag in the head section of the document:</p>
 * <pre><code>e.g. &lt;meta property="cq:pagemodel_root_url" content="/content/test.model.json"\&gt;</code></pre>
 *
 * @module PageModelManager
 *
 */
const PageModelManager = {

    /**
     * Triggered by the PageModelManager to indicate that the page model has been initialized.
     *
     * @event cq-pagemodel-init
     */

    /**
     * Triggered by the PageModelManager to indicate that the page model for the page has been loaded (fetched/updated)
     *
     * @event cq-pagemodel-loaded
     *
     * @type {Object}
     * @property {Object} detail
     * @property {Object} detail.model - The page model object
     *
     */

    /**
     * Used to indicate that the PageModelManager should update a page model given the data passed in the event.
     *
     * @event cq-pagemodel-update
     *
     * @type {Object}
     * @property {Object} detail
     * @property {Object} detail.msg -
     * @property {String} detail.msg.dataPath - Relative data path in the PageModel which needs to be updated
     * @property {String} detail.msg.pagePath - Absolute page path corresponding to the page in the PageModel which needs to be updated
     * @property {String} detail.msg.cmd - Command Action requested via Editable on the content Node
     * @property {Object} detail.msg.data - Data that needs to be updated in the PageModel at the given path
     */

    /**
     * Initializes the page model manager with the model corresponding to the given page path.
     * It will fetch the corresponding page model from the server and later use the given page path as the root page path.
     *
     * @static
     * @function init
     * @param {{}}      [cfg]                           - Configuration object.
     * @param {String}  [cfg.pagePath]                  - Absolute path of the page (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param {boolean} [cfg.immutable=true]            - Should the returned model be a copy
     * @returns {Promise} Promise resolved with the page model
     *
     * @fires cq-pagemodel-loaded
     * @fires cq-pagemodel-init
     */
    init: function(cfg) {
        rootModel = undefined;
        listenersMap = {};
        rootModelUrl = undefined;

        let pagePath, immutable, model;

        if (typeof cfg === "string" || !cfg) {
            // Compatibility layer with previous method signature
            pagePath = cfg;
            immutable = arguments[1] !== false;
            apiHost = arguments[2];
            model = arguments[3]

        } else {
            pagePath = cfg.pagePath;
            immutable = cfg.immutable !== false;
            apiHost = cfg.apiHost;
            model = cfg.model;
        }

        // The model is already provided, it should only be stored, along with the rootModelUrl
        if (model) {
            storePageModel('', model, true);
            if (model[Constants.PATH_PROP]) {
                rootModelUrl = model[Constants.PATH_PROP];
            }
            return Promise.resolve(model);
        }
         
        pagePath = Helpers.internalize(pagePath);

        const metaPropertyModelUrl = Helpers.internalize(Helpers.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROOT_URL));
        const currentPageModelUrl = Helpers.internalize(Helpers.getCurrentPageModelUrl());
        // Fetch the app root model
        // 1. consider the provided page path
        // 2. consider the meta property value
        // 3. fallback to the model path contained in the URL
        const rootModelPath = pagePath || metaPropertyModelUrl || currentPageModelUrl;

        initPromise = new Promise((resolve, reject) => {
            return fetchModel(rootModelPath, true)
                .then(pageModel => {
                    // Store the root model
                    storePageModel('', pageModel, true);
                    // The child model URL can either be provided or contained in the current page URL
                    const childModelPath = pagePath || currentPageModelUrl;
                    // Append the child page if the page model doesn't correspond to the model root URL
                    // and if the model root path doesn't already contain the child model (asynchronous page load)
                    if (!isPageURLRoot(childModelPath, metaPropertyModelUrl) && !hasChildOfPath(pageModel, childModelPath)) {
                        // Fetch the child model
                        fetchModel(childModelPath)
                            .then(childModel => {
                                storePageModel(childModelPath, childModel, false);
                                initPromise = undefined;
                                resolveInitPageModel(resolve, immutable);
                            });
                    } else {
                        initPromise = undefined;
                        resolveInitPageModel(resolve, immutable);
                    }
                }).catch(function (error) {
                    reject(new Error(error));
                    rootModel = undefined;
                    rootModelUrl = undefined;
                    initPromise = undefined;
                });
        });
        return initPromise;
    },

    /**
     * Returns the path to the root model the page model manager has been initialized with
     *
     * @return {string}
     */
    getRootModelUrl() {
        return rootModelUrl;
    },

    /**
     * Extracts the data stored in the page model at the given path and returns a promise resolved with that data.
     * If the requested model isn't stored yet, it will try to load it from the server.
     *
     * @static
     * @function getData
     * @param {{}}      [cfg]                           Configuration object.
     * @param {String}  [cfg.pagePath]                  Absolute path of the page (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param {String}  [cfg.dataPath]                  Relative path to the data in the page model (e.g., "root/mychild"). If not provided, the entire page model is extracted.
     * @param {boolean} [cfg.immutable=true]            Should the returned model be a copy
     * @param {boolean} [cfg.forceReload=false]         Should the page model be reloaded from the server
     * @returns {Promise} Promise resolved with the corresponding model data.
     *
     * @fires cq-pagemodel-loaded
     * @fires cq-pagemodel-update
     */
    getData: function(cfg) {
        let pagePath, dataPath, immutable, forceReload;

        if (typeof cfg === "string" || !cfg) {
            // Compatibility layer with previous method signature
            pagePath = '';
            dataPath = arguments[0];
            immutable = arguments[1] !== false;
            forceReload = arguments[2];
        } else {
            pagePath = adaptPagePath(cfg.pagePath);
            dataPath = cfg.dataPath;
            immutable = cfg.immutable !== false;
            forceReload = cfg.forceReload || false;
        }

        pagePath = Helpers.internalize(pagePath);
        // Wait for the initPromise to finish
        let currentInitPromise = initPromise || Promise.resolve();
        return currentInitPromise.then(() => {
            // If the model is empty, proceed with the initialization
            if (!rootModel) {
                // First make sure init() has completed and then try again
                return this.init(cfg).then(this.getData(cfg));
            } else {
                // At this point, we are ready to get data since init() has completed
                let pageModelFromCache = !pagePath ? rootModel : rootModel[Constants.CHILDREN_PROP] && rootModel[Constants.CHILDREN_PROP][pagePath];
                if (pageModelFromCache && !forceReload) {
                    // Use the model from cache
                    return new Promise((resolve, reject) => {
                        extractModel(dataPath, pageModelFromCache, immutable)
                        .then(resolve)
                        .catch(() => this.getData({
                            forceReload: true,
                            pagePath: pagePath,
                            dataPath: dataPath,
                            immutable: immutable
                        }).then(resolve).catch((error) => reject(new Error(error))));    
                    });
                } else {
                    // Can't use the model from cache: either there is no model cached for this path, or the forceReload parameter has been passed
                    return fetchModel(pagePath)
                        .then((pageModel) => {
                            return extractModel(dataPath, pageModel, immutable)
                                .then((modelData) => {
                                    if (!pageModelFromCache) {
                                        // There was no model cached for this path, then add a new entry for it in the cache
                                        storePageModel(pagePath, pageModel);
                                    } else {
                                        // There was a model cached for this path, so update the internal model data
                                        setData.call(this, pagePath, dataPath, modelData);
                                    }
                                    return modelData;
                                })
                                .catch((error) => Promise.reject(new Error(error)));
                        }).catch((error) => Promise.reject(error));
                }
            }
        });
    },

    /**
     * Add the given callback as a listener for changes at the given path.
     *
     * @static
     * @function addListener
     * @param {{}}      [cfg]                           Configuration object.
     * @param {String}  [cfg.pagePath]                  Absolute path of the page (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param {String}  [cfg.dataPath]                  Relative path to the data in the page model (e.g., "root/mychild"). An empty string correspond to the model of the current path
     * @param {String}  [cfg.callback]                  Function to be executed listening to changes at given path
     */
    addListener: function(cfg) {
        if (!cfg || cfg.pagePath === undefined && cfg.dataPath === undefined) {
            return;
        }

        let pagePath = adaptPagePath(cfg.pagePath);
        let dataPath = cfg.dataPath;
        let callback = cfg.callback;

        listenersMap[pagePath] = listenersMap[pagePath] || {};
        listenersMap[pagePath][dataPath] = listenersMap[pagePath][dataPath] || [];
        listenersMap[pagePath][dataPath].push(callback);
    },

    /**
     * Remove the callback listener from the given path path.
     *
     * @static
     * @function removeListener
     * @param {{}}      [cfg]                           Configuration object.
     * @param {String}  [cfg.pagePath]                  Absolute path of the page (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param {String}  [cfg.dataPath]                  Relative path to the data in the page model (e.g., "root/mychild").
     * @param {String}  [cfg.callback]                  Listener function to be removed.
     */
    removeListener: function(cfg) {
        if (!cfg || cfg.pagePath === undefined && cfg.dataPath === undefined) {
            return;
        }

        let pagePath = adaptPagePath(cfg.pagePath);
        let dataPath = cfg.dataPath;
        let callback = cfg.callback;

        let listenersForPath = listenersMap[pagePath] && listenersMap[pagePath][dataPath];
        if (listenersForPath) {
            let index = listenersForPath.indexOf(callback);
            if (index !== -1) {
                listenersForPath.splice(index, 1);
            }
        }
    }
};

/**
 * Entry point to update the page model from an external source written in es5 such as the page editor source code
 */
if (Helpers.isBrowser()) {
    window.addEventListener(EventType.PAGE_MODEL_UPDATE, function(event) {
        if (!event || !event.detail || !event.detail.msg) {
            console.error('PageModelManager.js', 'No message passed to cq-pagemodel-update', event);
            return;
        }
        
        updateModel.call(PageModelManager, event.detail.msg);
    });
}
export default PageModelManager;
