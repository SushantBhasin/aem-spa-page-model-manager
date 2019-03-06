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
import { PathUtils } from "./PathUtils";
import Constants from "./Constants";
import MetaProperty from "./MetaProperty";
import {EditorClient, triggerPageModelLoaded} from "./EditorClient";
import { ModelClient } from "./ModelClient";
import { ModelStore } from "./ModelStore";

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
    return !!(model && childPath && model[Constants.CHILDREN_PROP] && model[Constants.CHILDREN_PROP][PathUtils.sanitize(childPath)]);
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
    return !pagePath || !modelRootPath || PathUtils.sanitize(pagePath) === PathUtils.sanitize(modelRootPath);
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

    const localPath = PathUtils.internalize(path);

    if (!this.modelStore || !this.modelStore.rootPath) {
        return localPath;
    }

    const localRootModelPath = PathUtils.sanitize(this.modelStore.rootPath);

    return localPath === localRootModelPath ? '' : localPath;
}

/**
 * The ModelManager gathers all the components implicated in managing the model data
 */
class ModelManager {

    /**
     * Configuration object for the getData function
     *
     * @typedef {{}} GetDataConfig
     * @property {string} path             - Path of the data model
     * @property {boolean} forceReload     - Should the data model be reloaded
     */

    /**
     * Configuration object for the Initialization function
     *
     * @typedef {{}} InitializationConfig
     * @property {string} [path]                   - Path of the data model
     * @property {{}} [model]                      - Model structure to initialize the page model manager with
     * @property {ModelClient} [modelClient]       - Model client
     */

    get modelClient() {
        return this._modelClient;
    }

    get modelStore() {
        return this._modelStore;
    }

    /**
     * Verifies the integrity of the provided dependencies
     *
     * @return {Promise}
     * @private
     */
    _checkDependencies() {
        if (!this.modelClient) {
            return Promise.reject("No ModelClient registered");
        }

        if (!this.modelStore) {
            return Promise.reject("No ModelManager registered");
        }

        return Promise.resolve();
    }

    /**
     * Transforms the given path into a model URL
     *
     * @param path
     * @return {*}
     * @private
     */
    _toModelPath(path) {
        let url = PathUtils.addSelector(path, 'model');
        url = PathUtils.addExtension(url, 'json');
        url = PathUtils.externalize(url);

        return PathUtils.makeAbsolute(url);
    }

    /**
     * Initializes the ModelManager using the given path to resolve a data model.
     * If no path is provided, fallbacks are applied in the following order:
     *
     * - meta property: cq:pagemodel_root_url
     * - current pathname of the browser
     *
     * Once the initial model is loaded and if the data model doesn't contain the path of the current pathname, the library attempts to fetch a fragment of model.
     *
     * @param {string|InitializationConfig} [config]                - URL to the data model or configuration object
     * @return {Promise}
     */
    initialize(config) {
        this.destroy();
        let path;
        let initialModel;

        if (!config || typeof config === 'string') {
            path = config;
        } else if (config) {
            path = config.path;
            this._modelClient = config.modelClient;
            initialModel = config.model;
        }

        this._listenersMap = {};
        this._fetchPromises = {};
        this._initPromise = null;

        const metaPropertyModelUrl = PathUtils.internalize(PathUtils.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROOT_URL));
        const currentPathname = PathUtils.sanitize(PathUtils.getCurrentPathname());
        // Fetch the app root model
        // 1. consider the provided page path
        // 2. consider the meta property value
        // 3. fallback to the model path contained in the URL
        const rootModelURL = path || metaPropertyModelUrl || currentPathname;

        if (!rootModelURL) {
            console.error('ModelManager.js', 'Cannot initialize without an URL to fetch the root model');
        }

        if (!this._modelClient) {
            this._modelClient = new ModelClient();
        }

        this._editorClient = new EditorClient(this);
        this._modelStore = new ModelStore(rootModelURL, initialModel);

        this._initPromise = this._checkDependencies().then(() => {
            const rootModelPath = PathUtils.sanitize(rootModelURL);
            let data = this.modelStore.getData(rootModelPath);

            if (data) {
                triggerPageModelLoaded(data);
                return data;
            } else {
                return this._fetchData(rootModelURL).then((rootModel) => {
                    this.modelStore.initialize(rootModelPath, rootModel);
                    // Append the child page if the page model doesn't correspond to the URL of the root model
                    // and if the model root path doesn't already contain the child model (asynchronous page load)
                    if (!isPageURLRoot(currentPathname, metaPropertyModelUrl) && !hasChildOfPath(rootModel, currentPathname)) {
                        return this._fetchData(currentPathname).then((model) => {
                            this.modelStore.insertData(PathUtils.sanitize(currentPathname), model);
                            let data = this.modelStore.getData();
                            triggerPageModelLoaded(data);
                            return data;
                        });
                    } else {
                        let data = this.modelStore.getData();
                        triggerPageModelLoaded(data);
                        return data;
                    }
                });
            }
        });

        return this._initPromise;
    }

    /**
     * Fetches a model for the given path
     *
     * @param {string} path - Model path
     * @return {Promise}
     * @private
     */
    _fetchData(path) {
        if (this._fetchPromises.hasOwnProperty(path)) {
            return this._fetchPromises[path];
        }

        let promise = this.modelClient.fetch(this._toModelPath(path));

        this._fetchPromises[path] = promise;

        promise.then((obj) => {
            delete this._fetchPromises[path];
            return obj;
        }).catch((error) => {
            delete this._fetchPromises[path];
            return error;
        });

        return promise;
    }

    _storeData(path, data) {
        const isItem = PathUtils.isItem(path);

        this.modelStore.insertData(path, data);

        // If the path correspond to an item notify either the parent item
        // Otherwise notify the app root
        this._notifyListeners(path);

        if (!isItem) {
            // As we are expecting a page, we notify the root
            this._notifyListeners('');
        }

        return data;
    }

    /**
     * Returns the path of the data model root
     *
     * @return {string}
     */
    get rootPath() {
        return this.modelStore.rootPath;
    }

    /**
     * Returns the model for the given configuration
     * @param {string|GetDataConfig} [config]     - Either the path of the data model or a configuration object. If no parameter is provided the complete model is returned
     * @return {Promise}
     */
    getData(config) {
        let path;
        let forceReload = false;

        if (typeof config === 'string') {
            path = config;
        } else if (config) {
            path = config.path;
            forceReload = config.forceReload;
        }

        let initPromise = this._initPromise || Promise.resolve();

        return initPromise.then(() => this._checkDependencies())
            .then(() => {
                if (!forceReload) {
                    let item = this.modelStore.getData(path);

                    if (item) {
                        return Promise.resolve(item);
                    }
                }

                // We are not having any items
                // We want to reload the item
                return this._fetchData(path).then((data) => this._storeData(path, data));
            });
    }

    /**
     * Notifies the listeners for a given path
     *
     * @param {string} path - Path of the data model
     * @private
     */
    _notifyListeners(path) {
        path = PathUtils.adaptPagePath.call(this, path);
        let listenersForPath = this._listenersMap[path];

        if (!listenersForPath) {
            return;
        }

        if (listenersForPath.length) {
            listenersForPath.forEach((listener) => {
                try {
                    listener();
                } catch (e) {
                    console.error('Error in listener ' + listenersForPath + ' at path ' + path + ' : ' + e);
                }
            });
        }
    }


    /**
     * Add the given callback as a listener for changes at the given path.
     *
     * @param {String}  [path]  Absolute path of the resource (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param {String}  [callback]  Function to be executed listening to changes at given path
     */
    addListener(path, callback) {
        if (!path && typeof path !== 'string') {
            return;
        }

        let adaptedPath = adaptPagePath.call(this, path);

        this._listenersMap[adaptedPath] = this._listenersMap[path] || [];
        this._listenersMap[adaptedPath].push(callback);
    }

    /**
     * Remove the callback listener from the given path path.
     *
     * @param {String}  [path] Absolute path of the resource (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param {String}  [callback]  Listener function to be removed.
     */
    removeListener(path, callback) {
        if (!path) {
            return;
        }
        let adaptedPath = adaptPagePath.call(this, path);

        let listenersForPath = this._listenersMap[adaptedPath];
        if (listenersForPath) {
            let index = listenersForPath.indexOf(callback);
            if (index !== -1) {
                listenersForPath.splice(index, 1);
            }
        }
    }

    /**
     * @private
     */
    destroy() {
        this._fetchPromises = null;
        delete this._fetchPromises;
        this._listenersMap = null;
        delete this._listenersMap;

        if (this.modelClient && this.modelClient.destroy) {
            this.modelClient.destroy();
        }

        if (this.modelStore && this.modelStore.destroy) {
            this.modelStore.destroy();
        }

        if (this._editorClient && this._editorClient.destroy) {
            this._editorClient.destroy();
        }
    }
}

export default new ModelManager();