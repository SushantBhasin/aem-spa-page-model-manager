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
import Constants from "./Constants";
import { PathUtils } from "./PathUtils";

/**
 * The ModelStore is in charge of providing access to the data model. It provides the CRUD operations over the model.
 * To protect the integrity of the data it initially returns immutable data. If needed, you can request a mutable object.
 */
export class ModelStore {

    /**
     * Item wrapper containing information about the item parent
     *
     * @typedef {Object} ItemWrapper
     * @property {string} [key]             - Name of the item
     * @property {{}} [data]                - Item data
     * @property {{}} [parent]                - Parent item
     * @property {string} [parentPath]        - Path of the parent item
     */

    /**
     * @param {string} [rootPath]     - Root path of the model
     * @param {{}} [data]             - Initial model
     */
    constructor(rootPath, data) {
        this.initialize(rootPath, data);
        this._pageContentDelimiter = [Constants.JCR_CONTENT];
    }

    /**
     * Initializes the the ModelManager
     *
     * @param {string} rootPath     - Root path of the model
     * @param {{}} data             - Initial model
     */
    initialize(rootPath, data) {
        if (data) {
            this._data = data;
        }

        this._rootPath = rootPath;
    }

    /**
     * Returns the current root path
     *
     * @return {string}
     */
    get rootPath() {
        return this._rootPath;
    }

    /**
     *
     * @param {string} pagePath - Path of the page
     *
     * @return {{}|undefined} - Data of the page
     * @private
     */
    _getPageData(pagePath) {
        if (!this._data) {
            return;
        }

        if ('' === pagePath || pagePath === this._data[Constants.PATH_PROP] || pagePath === this.rootPath) {
            return this._data;
        }

        return  this._data[Constants.CHILDREN_PROP] && this._data[Constants.CHILDREN_PROP][pagePath];
    }

    /**
     * Retrieves the item and eventually returns the data wrapped with the parent information
     *
     * @param {string} path                 - Path of the item
     * @param {{}} [data=_data]             - Data to be explored
     * @param {{}} [parent]                 - Parent data
     * @param {string} [parentPath='']      - Path of the parent data
     * @return {ItemWrapper}
     * @private
     */
    _findItemData(path, data = this._data, parent = undefined, parentPath = '') {
        let answer = {
            parent: parent,
            parentPath: parentPath
        };

        let items = data[Constants.ITEMS_PROP];

        if (!items) {
            return answer;
        }

        for (let pathKey in items) {
            if (!items.hasOwnProperty(pathKey)) {
                continue;
            }

            let childItem = items[pathKey];

            // Direct child. We reached the leaf
            if (pathKey === path) {
                answer.data = items[pathKey];
                answer.key = pathKey;
                return answer;
            } else {
                // Continue traversing
                let subPath = PathUtils.subpath(path, pathKey);
                let pageDelimiter = PathUtils._getStartStrings(subPath, this._pageContentDelimiter);
                let childParentPath = PathUtils.join([parentPath, pathKey, pageDelimiter]);
                subPath = PathUtils.trimStrings(subPath, this._pageContentDelimiter);

                if (subPath !== path) {
                    childItem = this._findItemData(subPath, childItem, childItem, childParentPath);

                    if (childItem) {
                        return childItem;
                    }
                }
            }
        }

        return answer;
    }

    /**
     * Replaces the data in the given location
     *
     * @param {string} path     - Path of the data
     * @param {{}} newData      - New data to be set
     */
    setData(path, newData) {
        let itemKey = PathUtils.getNodeName(path);
        let data = this.getData(PathUtils.getParentNodePath(path), false);

        if (data && data[Constants.ITEMS_PROP]) {
            let localData = clone(newData);
            data[Constants.ITEMS_PROP][itemKey] = localData.value;
        }
    }

    /**
     * Returns the data for the given path. If no path is provided, it returns the whole data
     *
     * @param {string} [path]                   - Path to the data
     * @param {boolean} [immutable=true]        - Should the returned data be a clone
     * @return {*}
     */
    getData(path, immutable = true) {
        if (!path && typeof path !== 'string') {
            return immutable ? clone(this._data) : this._data;
        }

        // Request for the root path
        // Returns the full data
        if (path === this._rootPath || path === this._rootPath + '/' + Constants.JCR_CONTENT) {
            return immutable? clone(this._data) : this._data;
        }

        const dataPaths = PathUtils.splitPageContentPaths(path);

        let pageData = this._getPageData(dataPaths.pagePath);

        // If there is no page
        // or if we are getting the data of a page
        // return the page data
        if (!pageData || !dataPaths.itemPath) {
            return immutable? clone(pageData) : pageData;
        }

        let result = this._findItemData(dataPaths.itemPath, pageData);

        if (result) {
            return immutable ? clone(result.data) : result.data;
        }
    }

    /**
     * Insert the provided data at the location of the given path. If no sibling name is provided the data is added at the end of the list
     *
     * @param {string} path                     - Path to the data
     * @param {{}} data                         - Data to be inserted
     * @param {string} [siblingName]            - Name of the item before or after which to add the data
     * @param {boolean} [insertBefore=false]    - Should the data be inserted before the sibling
     */
    insertData(path, data, siblingName, insertBefore = false) {
        data = clone(data);
        // We need to find the parent
        if (!path) {
            console.warn("No path provided for data:", data);
            return;
        }

        const isItem = PathUtils.isItem(path);

        if (!isItem && this._data[Constants.CHILDREN_PROP]) {
            // Page data
            this._data[Constants.CHILDREN_PROP][path] = data;
            return;
        }

        // Item data
        const dataPaths = PathUtils.splitPageContentPaths(path);
        let pageData = this._getPageData(dataPaths.pagePath);
        let result = this._findItemData(dataPaths.itemPath, pageData);
        let parent = result.parent || pageData || this._data;
        let itemName = PathUtils.getNodeName(dataPaths.itemPath);

        if (parent && parent.hasOwnProperty(Constants.ITEMS_PROP)) {
            parent[Constants.ITEMS_PROP][itemName] = data;

            if (parent.hasOwnProperty(Constants.ITEMS_ORDER_PROP)) {
                let index = parent[Constants.ITEMS_ORDER_PROP].indexOf(siblingName);

                if (index > -1) {
                    parent[Constants.ITEMS_ORDER_PROP].splice(insertBefore ? index : index + 1, 0, itemName);
                } else {
                    parent[Constants.ITEMS_ORDER_PROP].push(itemName);
                }
            }
        }
    }

    /**
     * Removes the data located at the provided location
     *
     * @param {string} path         - Path of the data
     * @return {string|undefined}   - Path to the parent item initially containing the removed data
     */
    removeData(path) {
        if (!path) {
            return;
        }

        const isItem = PathUtils.isItem(path);

        if (!isItem && this._data[Constants.CHILDREN_PROP]) {
            // Page data
            delete this._data[Constants.CHILDREN_PROP][path];
            return;
        }

        // Item data
        const dataPaths = PathUtils.splitPageContentPaths(path);
        let pageData = this._getPageData(dataPaths.pagePath);
        let result = this._findItemData(dataPaths.itemPath, pageData);

        if (result.data) {
            if (result && result.parent && result.parent.hasOwnProperty(Constants.ITEMS_PROP)) {
                let { parent } = result;
                let itemName = PathUtils.getNodeName(dataPaths.itemPath);

                delete parent[Constants.ITEMS_PROP][itemName];
                delete result.data;
                delete result.parent;

                if (parent.hasOwnProperty(Constants.ITEMS_ORDER_PROP)) {
                    let index = parent[Constants.ITEMS_ORDER_PROP].indexOf(itemName);
                    parent[Constants.ITEMS_ORDER_PROP].splice(index, 1);
                }

                return result.parentPath;
            }
        } else {
            console.warn(`Item for path ${path} was not found! Nothing to remove then.`);
        }
    }

    /**
     * @private
     */
    destroy() {
        this._data = null;
        this._rootPath = null;
        this._pageContentDelimiter = null;

        delete this._data;
        delete this._rootPath;
        delete this._pageContentDelimiter;
    }
}