/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
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

const ITEMS_PN = ':items';
const ITEMS_ORDER_PN = ':itemsOrder';
const DEFAULT_MODEL_PATH = window.location.pathname.replace(/\.htm(l)?$/,'.model.json');

/**
 * Contains the Page Model Object.
 * It is set via {@code PageModelManager#init}
 * @private
 */
let pageModel;

/**
 * Map of paths and their registered listeners
 * @private
 */
let listeners = {};

/**
 * Call listeners on the given path
 *
 * @param {string} path - Path
 * @private
 */
function notifyListeners(path) {
    let listenersForPath = listeners[path];

    if (listenersForPath) {
        listenersForPath.forEach(function(listener) {
            try {
                listener();
            }
            catch (e) {
                console.warn('Error in listener at path ' + path + ' : ' + e);
            }
        });
    }
}

/**
 * Fires the @event 'cq-pagemodel-loaded' with the needed data
 *
 * @fires Window#cq-pagemodel-loaded
 * @private
 */
function triggerPageModelLoaded() {
    // Deep copy to protect the internal state of the page model
    window.dispatchEvent(new CustomEvent('cq-pagemodel-loaded', {
        detail: {
            model: clone(pageModel)
        }
    }));
}

/**
 * Returns the child Model at the given path from the given PageModel
 *
 * @param {string} path  Path to the child object
 * @param {{}} model     Parent model object
 * @private
 */
function getModelChild(path, model) {
    if (!model || !path) {
        console.error('PageModelManager.js', 'Cannot introspect model', path, model);
        return;
    }

    let elements = path.split('/');

    let child = model[ITEMS_PN][elements.shift()];

    if (!child || elements.length < 1) {
        return child;
    }

    return getModelChild(elements.join("/"), child);
}

/**
 * Resolves the model for the given path
 *
 * @param {string} [path]           Path to the child item
 * @param {{}} pageModel            Model of the page
 * @param {function} resolveFnc     Function to be called with the resolved model
 * @param {boolean} [immutable=true]     Should a returned pageModel be a copy
 * @private
 */
function resolveModel(path, pageModel, resolveFnc, immutable) {
    let model;
    // Is the path undefined, null, falsy, empty or equal to "/"
    if (!path || path.trim().length < 1 || path === '/') {
        model = immutable !== false ? clone(pageModel) : pageModel;
        resolveFnc(model);

        return;
    }

    model = getModelChild(path, pageModel);

    resolveFnc(immutable !== false ? clone(model) : model);
}

/**
 * Splits the path into parent path and the node name as key
 * If the path is '/A/B/C', it will return {'parent': '/A/B', 'key': 'C'}
 *
 * @param {string} path - Path string
 * @returns {{}} Returns an Object containing parent path mapped to 'parent'
 *               and key name mapped to 'key'
 * @private
 */
function splitParentPath(path) {
    let elements = path.split('/');
    let key = elements.pop();
    let parent = elements.join('/');
    return { 'parent': parent, 'key': key };
}

/**
 * Updates the PageModel with the provided data
 *
 * @fires Window#cq-pagemodel-loaded
 * @param {UpdateEvent.detail.msg} msg - Object containing the data to update the PageModel
 * @private
 */
function updateModel(msg) {
    if (!msg || !msg.cmd || !msg.path) {
        console.error('PageModelManager.js', 'Not enough data received to update the Page Model');
        return;
    }
    // Path in the PageModel which needs to be updated
    let path = msg.path;
    // Command Action requested via Editable on the content Node
    let cmd = msg.cmd;
    // Data that needs to be updated in the PageModel at {path}
    let data = clone(msg.data);

    // Variable to hold the Promise Object
    let promise;

    switch(cmd) {
        case 'replace':
            promise = setData.call(this, path, data);
            break;

        // If we ever start using it via the EditableActions in future
        // case 'replaceContent':

        case 'insertBefore':
            promise = insertPath.call(this, path, data, true);
            break;

        case 'insertAfter':
            promise = insertPath.call(this, path, data, false);
            break;

        case 'moveBefore':
            promise = movePath.call(this, path, data, true);
            break;

        case 'moveAfter':
            promise = movePath.call(this, path, data, false);
            break;

        case 'delete':
            promise = deletePath.call(this, path);
            break;
    }

    promise.then(triggerPageModelLoaded);
}

/**
 * Delete data at given path from the Page Model
 *
 * @param {string} path
 * @returns {Promise}
 * @private
 */
function deletePath(path) {
    let p = splitParentPath(path);

    return this.getData(p.parent, false).then(function(data) {
        return new Promise(function (resolve) {

        delete data[ITEMS_PN][p.key];
        let index = data[ITEMS_ORDER_PN].indexOf(p.key);
        data[ITEMS_ORDER_PN].splice(index, 1);
        notifyListeners(p.parent);

            resolve();
        });
    });
}

/**
 * Insert the new data structure before/after the given path in the Page Model
 *
 * @param {string} path - The path in the Page Model to be updated
 * @param {{}} data - New Data Object to be set
 * @param {boolean} insertBefore - 'true' to insert new data before the path, 'false' otherwise
 * @returns {Promise}
 * @private
 */
function insertPath(path, data, insertBefore) {
    let parentAndKey = splitParentPath(path);

    return this.getData(parentAndKey.parent, false).then(function(parentData) {
        // Insert the new data item as a sibling of the item at given path
        let localData = clone(data);
        parentData[ITEMS_PN][localData.key] = localData.value;

        // Set order of the new item
        let index = parentData[ITEMS_ORDER_PN].indexOf(parentAndKey.key);

        if (index > -1) {
            parentData[ITEMS_ORDER_PN].splice(insertBefore ? index : index + 1, 0, localData.key);
        } else {
            parentData[ITEMS_ORDER_PN].push(localData.key);
        }

        notifyListeners(parentAndKey.parent);
    });
}

/**
 * Move data from {path} to {data.key} before/after {data.sibling}
 *
 * @param {string} path - The path from where the data has to be moved
 * @param {{}} data
 * @param {boolean} insertBefore - Set to 'true' to move data before {data.sibling}, 'false' otherwise
 * @returns {Promise}
 * @private
 */
function movePath(path, data, insertBefore) {
    let self = this;

    return this.getData(path, false).then(function (nodeData) {

        return deletePath.call(self, path).then(function() {
            let localData = clone(data);
            let insertData = {
                key: localData.key,
                value: nodeData
            };

            return insertPath.call(self, localData.sibling, insertData, insertBefore);
        });
    });
}

/**
 * Set newData at the given path in the PageModel
 *
 * @param {string} path - Path in the PageModel at which to set new data
 * @param {Object} newData - New Data Object to be set
 * @returns {Promise}
 */
function setData(path, newData) {
    let splitPaths = splitParentPath(path);

    return this.getData(splitPaths.parent, false).then(function (data) {
        if (data[ITEMS_PN]) {
            let localData = clone(newData);
            data[ITEMS_PN][splitPaths.key] = localData.value;

            notifyListeners(path);
        }
    });
}

/**
 * The {@code PageModelManager} is responsible for centralizing, synchronizing and providing access to the model of the page
 * @exports PageModelManager
 *
 * @type {{init: PageModelManager.init, getData: PageModelManager.getData, setData: PageModelManager.setData, addListener: PageModelManager.addListener, removeListener: PageModelManager.removeListener}}
 */
const PageModelManager = {

    /**
     * Triggered by the PageModelManager to indicate that the PageModel for the page was loaded (fetched/updated)
     *
     * @event Window#cq-pagemodel-loaded
     */

    /**
     * Event object containing the updated model
     * @typedef {Object} UpdateEvent
     * @property {Object} detail
     * @property {Object} detail.msg -
     * @property detail.msg.path - Path in the PageModel which needs to be updated
     * @property detail.msg.cmd - Command Action requested via Editable on the content Node
     * @property detail.msg.data - Data that needs to be updated in the PageModel at {path}
     */

    /**
     * The PageModel for the page should be updated using the data passed in the event
     * @type {UpdateEvent}
     * @event Window#cq-pagemodel-update
     */

    /**
     * Fetch the Page Model from the server.
     *
     * @fires Window#cq-pagemodel-loaded
     * @param {string} path
     * @returns {Promise} Promise resolved by PageModel
     */
    init: function(path) {
        path = path || DEFAULT_MODEL_PATH;

        return new Promise(function(resolve, reject) {

            if (!path) {
                console.warn('PageModelManager.js', 'Fetching model rejected for path:', path);

                reject();
            }

            let xhr = new XMLHttpRequest();
            xhr.open('GET', path);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');

            xhr.onload = function() {
                if (xhr.status >= 400) {
                    console.error('Problem with request: ${res.statusCode}');
                } else {
                    listeners = {};
                    pageModel = JSON.parse(this.responseText);
                    resolve(clone(pageModel));

                    triggerPageModelLoaded();
                }
            };
            xhr.send();
        });
    },

    /**
     * Extracts the data stored in the pageModel at the given path and returns a Promise
     * resolved by that data
     *
     * @param {string}  [path]              Path to the child item
     * @param {boolean} [immutable=true]    Should a returned pageModel be a copy
     * returns {Promise}
     */
    getData: function(path, immutable) {
        let that = this;

        return new Promise(function (resolve) {
            if (pageModel) {
                resolveModel(path, pageModel, resolve, immutable);
            } else {
                // Wait for the page model to be available
                let retryResolveModel = function retryResolveModel() {
                    if (!pageModel) {
                        requestAnimationFrame(function () {
                            that.init().then(retryResolveModel);
                        });

                        return;
                    }

                    resolveModel(path, pageModel, resolve, immutable);
                };

                requestAnimationFrame(retryResolveModel);
            }
        });
    },

    /**
     * Add {callback} as a listener for changes at {path}
     *
     * @param {string} path - Path
     * @param {Function} callback - Function to be executed listening to changes at given path
     */
    addListener: function(path, callback) {
        listeners[path] = listeners[path] || [];
        listeners[path].push(callback);
    },

    /**
     * Remove {callback} listener from {path}
     * 
     * @param {string} path - Path
     * @param {Function} callback - Listener function to be removed  from path
     */
    removeListener: function(path, callback) {
        let listenersForPath = listeners[path];

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
