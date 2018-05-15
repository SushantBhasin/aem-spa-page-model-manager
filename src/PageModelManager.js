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
import InternalConstants from './InternalConstants';

const DEFAULT_MODEL_URL = window.location.pathname.replace(/\.htm(l)?$/, InternalConstants.DEFAULT_MODEL_JSON_EXTENSION);

/**
 * Page path on which the page model manager has been initialized.
 * The initial path is set via {@code PageModelManager#init}.
 *
 * @private
 */
let rootPagePath;

/**
 * Contains the different page model objects already loaded.
 * The initial page model is set via {@code PageModelManager#init}, and the additional ones can be set via {@code PageModelManager#getData}
 *
 * @private
 */
let pageModelMap = {};

/**
 * Contains the different listeners registered against their corresponding paths.
 * The map has the following schematic structure: map(page path => map(data path => listener)). An empty data path string can be set to identify a page listener
 *
 * @private
 */
let listenersMap = {};

/**
 * Returns the path to the page model. Either it is derived from a meta tag property called 'cq:page_model_url' or from the current window location.
 * @returns {String}
 *
 * @private
 */
function getPageModelPath() {
    const pageModelMeta = document.querySelector('meta[property="cq:page_model_url"]');
    return (pageModelMeta && pageModelMeta.content) || DEFAULT_MODEL_URL;
}

/**
 * Returns the listeners corresponding to the given page path and data path.
 * @param pagePath - Absolute path of the page corresponding to the page model. Defaults to {@code rootPagePath}.
 * @param dataPath - Relative path of the data in the page model. Defaults to empty string.
 * @returns {Array}
 *
 * @private
 */
function getListenersForPath(pagePath, dataPath) {
    pagePath = pagePath || rootPagePath;
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
    pagePath = pagePath || rootPagePath;
    dataPath = dataPath || '';

    let listenersForPath = getListenersForPath(pagePath, dataPath);

    if (listenersForPath.length === 0 && pagePath !== rootPagePath) {
        listenersForPath = getListenersForPath(rootPagePath, dataPath);
    }

    if (listenersForPath.length) {
        listenersForPath.forEach(function(listener) {
            try {
                listener();
            }
            catch (e) {
                console.warn('Error in listener ' + listenersForPath + ' at path ' + dataPath + ' : ' + e);
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
    // Deep copy to protect the internal state of the page model
    window.dispatchEvent(new CustomEvent('cq-pagemodel-loaded', {
        detail: {
            model: clone(pageModelMap)
        }
    }));
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
    let child = model[Constants.ITEMS_PROP][token];

    if (!child || tokens.length < 1) {
        return child;
    }

    return extractModelRecursively(tokens.join("/"), child);
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
                if(dataPath.startsWith("/") && pageModel[Constants.CHILDREN_PROP] && pageModel[Constants.CHILDREN_PROP][path]) {
                    model = pageModel[Constants.CHILDREN_PROP][path];
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
    let pagePath = msg.pagePath || rootPagePath;
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
    pagePath = pagePath || rootPagePath;
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
    pagePath = pagePath || rootPagePath;
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
    pagePath = pagePath || rootPagePath;
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
 * Adds a page to the {@link pageModelMap}. Either the page is the page model or the page is a child page of the root page
 *
 *
 * @param {String} [pagePath]       - absolute path of the page resource
 * @param {{}} pageModel            - model of the page to be added
 *
 * @private
 */
function storePageModel(pagePath, pageModel) {
    pagePath = pagePath || rootPagePath;

    let isRootPage = pagePath === rootPagePath;

    // Initialize the listeners and page model registries
    listenersMap[pagePath] = listenersMap[pagePath] || {};
    if (isRootPage) {
        pageModelMap = pageModel;
    } else {
        // Child pages
        pageModelMap[Constants.CHILDREN_PROP] = pageModelMap[Constants.CHILDREN_PROP] || {};
        pageModelMap[Constants.CHILDREN_PROP][pagePath] = pageModel;
    }

    // Inform that a new page model has been loaded
    triggerPageModelLoaded();

    // Notify the listeners of the newly added page
    notifyListeners(pagePath, '');

    // If the page is not the root, notify the root that a page has been added
    if (!isRootPage) {
        notifyListeners(rootPagePath, '');
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
    pagePath = pagePath || rootPagePath;

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
 * Returns the provided path extended with the provided extension
 *
 * @param {string} path         - path to be extended
 * @param {string} extension    - extension to be added
 * @returns {string}
 *
 * @private
 */
function addExtension(path, extension) {
    if (!extension || extension.length < 1) {
        return path;
    }

    if (!extension.startsWith('.')) {
        extension = '.' + extension;
    }

    if (!path || path.length < 1 || path.indexOf(extension) > -1) {
        return path;
    }

    let extensionPath = path;

    // Groups
    // 1. the resource
    // 2. the selectors and the extension
    // 3. the suffix
    // 4. the parameters
    let match = /^((?:[\/a-zA-Z0-9:_-]*)+)(?:\.?)([a-zA-Z0-9._-]*)(?:\/?)([a-zA-Z0-9\/\._-]*)(?:\??)([a-zA-Z0-9=&]*)$/g.exec(path);
    let queue = '';

    if (match && match.length > 2) {
        // suffix
        queue = match[3] ? '/' + match[3] : '';
        // parameters
        queue += match[4] ? '?' + match[4] : '';

        extensionPath = match[1] + '.' + match[2].replace(/\.htm(l)?/, extension) + queue;
    }

    return extensionPath.indexOf(extension) > -1 ? extensionPath: extensionPath + extension + queue;
}

/**
 * Returns the provided path extended with the provided selector
 *
 * @param {string} path         - path to be extended
 * @param {string} selector     - selector to be added
 * @returns {string}
 *
 * @private
 */
function addSelector(path, selector) {
    if (!selector || selector.length < 1) {
        return path;
    }

    if (!selector.startsWith('.')) {
        selector = '.' + selector;
    }

    if (!path || path.length < 1 || path.indexOf(selector) > -1) {
        return path;
    }

    let index = path.indexOf('.') || path.length;

    if (index < 0) {
        return path + selector;
    }

    return path.slice(0, index) + selector + path.slice(index, path.length);
}

/**
 * Fetch the page model from the server
 *
 * @param path - The path of the corresponding page
 * @return {Promise} Returns a promise resolved with the page model object
 *
 * @private
 */
function fetchModel(path) {
    path = addSelector(path, InternalConstants.DEFAULT_SLING_MODEL_SELECTOR);
    path = addExtension(path, 'json');

    return new Promise(function (resolve, reject) {
        if (!path) {
            let err = 'PageModelManager.js' + 'Fetching model rejected for path:' + path;
            console.warn(err);
            reject(err);
        }

        let xhr = new XMLHttpRequest();
        xhr.open('GET', path);
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
}

/**
 * <p> The PageModelManager is responsible for centralizing, synchronizing and providing access to the model of the page.</p>
 * <p> It can also manage multiple pages; see {@link ModelRouter}.</p>
 *
 * <h2>Configuration</h2>
 * <p>The PageModelManager can be configured using a meta tag in the head section of the document:</p>
 * <pre><code>e.g. &lt;meta property="cq:page_model_url" content="/content/test.model.json"\&gt;</code></pre>
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
     * @param {String} [pagePath] Path (absolute path) of the page to be managed. Defaults to the cq:page_model_url meta.
     * @returns {Promise} Promise resolved with the page model (copy).
     *
     * @fires cq-pagemodel-loaded
     * @fires cq-pagemodel-init
     */
    init: function(pagePath) {
        pageModelMap = {};
        listenersMap = {};
        pagePath = pagePath || getPageModelPath();
        let selectorIndex = pagePath.indexOf(".");

        rootPagePath = selectorIndex > -1 ? pagePath.substr(0, selectorIndex) : pagePath;

        return new Promise(function (resolve, reject) {
                return fetchModel(pagePath)
                    .then(function (pageModel) {
                        // The root page path is then used to retrieve data when passing a data path to getData()
                        storePageModel("", pageModel);

                        // Optionally inject an initial route
                        window.dispatchEvent(new CustomEvent('cq-pagemodel-init', {}));

                        resolve(clone(pageModel));
                    }).catch(function () {
                        reject(new Error("Cannot fetch model for the given path: " + pagePath));
                        rootPagePath = undefined;
                    });
        });
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
        let self = this;
        let pagePath, dataPath, immutable, forceReload;

        if (typeof cfg === "string" || !cfg) {
            // Compatibility layer with previous method signature
            pagePath = rootPagePath;
            dataPath = arguments[0];
            immutable = arguments[1] !== false;
            forceReload = arguments[2];
        } else {
            pagePath = cfg.pagePath || rootPagePath;
            dataPath = cfg.dataPath;
            immutable = cfg.immutable !== false;
            forceReload = cfg.forceReload || false;
        }

        return new Promise(function (resolve, reject) {
            if (!rootPagePath) {
                // First make sure init() has completed and then try again
                self.init().then(function () {
                    self.getData(cfg)
                        .then(resolve)
                        .catch(function () {
                            reject(new Error("Cannot get data for the given paths " + pagePath + ", " + dataPath));
                        });
                });
            } else {
                // At this point, we are ready to get data since init() has completed
                let pageModelFromCache = pagePath === rootPagePath ? pageModelMap : pageModelMap[Constants.CHILDREN_PROP] && pageModelMap[Constants.CHILDREN_PROP][pagePath];
                if (pageModelFromCache && !forceReload) {
                    // Use the model from cache
                    extractModel(dataPath, pageModelFromCache, immutable)
                        .then(function (modelData) {
                            // Resolve with the model data that corresponds to the data path (resolves with the entire page model when dataPath is falsy)
                            resolve(modelData);
                        })
                        .catch(function () {
                            // Child model hasn't been found in the page model from cache; then force server reload and try again
                            self.getData({
                                forceReload: true,
                                pagePath: pagePath,
                                dataPath: dataPath,
                                immutable: immutable
                            })
                                .then(resolve)
                                .catch(function () {
                                    reject(new Error("Cannot get data for the given paths " + pagePath + ", " + dataPath));
                                });
                        });
                } else {
                    // Can't use the model from cache: either there is no model cached for this path, or the forceReload parameter has been passed
                    fetchModel(pagePath)
                        .then(function (pageModel) {
                            extractModel(dataPath, pageModel, immutable)
                                .then(function (modelData) {
                                    if (!pageModelFromCache) {
                                        // There was no model cached for this path, then add a new entry for it in the cache
                                        storePageModel(pagePath, pageModel);
                                    } else {
                                        // There was a model cached for this path, so update the internal model data
                                        setData.call(self, pagePath, dataPath, modelData);
                                    }
                                    resolve(modelData);
                                })
                                .catch(function () {
                                    reject(new Error("Cannot extract child model for the given paths " + pagePath + ", " + dataPath));
                                });
                        }).catch(function () {
                            reject(new Error("Cannot fetch model for the given path " + pagePath));
                        });
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
        let pagePath = cfg.pagePath || rootPagePath;
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
        let pagePath = cfg.pagePath || rootPagePath;
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
window.addEventListener('cq-pagemodel-update', function(event) {
    if (!event || !event.detail || !event.detail.msg) {
        console.warn('PageModelManager.js', 'No message passed to cq-pagemodel-update', event);
        return;
    }
    
    updateModel.call(PageModelManager, event.detail.msg);

});

export default PageModelManager;
