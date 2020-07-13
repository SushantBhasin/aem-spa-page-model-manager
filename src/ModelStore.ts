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
import { Model } from './Model';
import { PathUtils } from './PathUtils';

/**
 * Item wrapper containing information about the item parent
 *
 * @typedef {Object} ItemWrapper
 * @property {string} [key]             - Name of the item
 * @property {{}} [data]                - Item data
 * @property {{}} [parent]                - Parent item
 * @property {string} [parentPath]        - Path of the parent item
 */
interface ItemWrapper {
    parent?: Model;
    parentPath?: string;
    data?: Model;
    key?: string;
}
/**
 * The ModelStore is in charge of providing access to the data model. It provides the CRUD operations over the model.
 * To protect the integrity of the data it initially returns immutable data. If needed, you can request a mutable object.
 */
export class ModelStore {
    private _pageContentDelimiter: string[] | null;
    private _data: Model | null = null;
    private _rootPath: string | null = null;

    /**
     * @param {string} [rootPath]     - Root path of the model
     * @param {{}} [data]             - Initial model
     */
    constructor(rootPath: string, data?: Model) {
        this.initialize(rootPath, data ? data : {});
        this._pageContentDelimiter = [Constants.JCR_CONTENT];
    }

    /**
     * Initializes the the ModelManager
     *
     * @param {string} rootPath     - Root path of the model
     * @param {{}} data             - Initial model
     */
    public initialize(rootPath: string, data: Model) {
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
    public get rootPath(): string {
        return this._rootPath || '';
    }

    public get dataMap(): any {
        return this._data;
    }

    /**
     * Replaces the data in the given location
     *
     * @param {string} path     - Path of the data
     * @param {{}} newData      - New data to be set
     */
    public setData(path: string, newData: any = {}) {
        const itemKey = PathUtils.getNodeName(path);

        if (itemKey) {
            const data = this.getData(PathUtils.getParentNodePath(path), false);

            if (data && data[Constants.ITEMS_PROP]) {
                const localData = clone(newData);
                const items = data[Constants.ITEMS_PROP] || {};
                items[itemKey] = localData.value;
                data[Constants.ITEMS_PROP] = items;
            }
        }
    }

    /**
     * Returns the data for the given path. If no path is provided, it returns the whole data
     *
     * @param {string} [path]                   - Path to the data
     * @param {boolean} [immutable=true]        - Should the returned data be a clone
     * @return {*}
     */
    public getData<M extends Model>(path?: string | null, immutable = true): M | undefined {
        if (!path && (typeof path !== 'string')) {
            return (immutable ? clone(this._data) : this._data) as M;
        }

        // Request for the root path
        // Returns the full data
        if ((path === this._rootPath) || (path === `${this._rootPath}/${Constants.JCR_CONTENT}`)) {
            return (immutable ? clone(this._data) : this._data) as M;
        }

        const dataPaths = PathUtils.splitPageContentPaths(path);

        if (dataPaths) {
            const pageData = this._getPageData(dataPaths.pagePath);

            // If there is no page
            // or if we are getting the data of a page
            // return the page data
            if (!pageData || !dataPaths.itemPath) {
                return (immutable ? clone(pageData) : pageData) as M;
            }

            const result = this._findItemData(dataPaths.itemPath, pageData);

            if (result) {
                return (immutable ? clone(result.data) : result.data) as M;
            }
        }
    }

    /**
     * Insert the provided data at the location of the given path. If no sibling name is provided the data is added at the end of the list
     *
     * @param {string} path                     - Path to the data
     * @param {{}} data                         - Data to be inserted
     * @param {string|null} [siblingName]            - Name of the item before or after which to add the data
     * @param {boolean} [insertBefore=false]    - Should the data be inserted before the sibling
     */
    public insertData(path: string, data: Model, siblingName?: string | null, insertBefore = false) {
        data = clone(data);

        // We need to find the parent
        if (!path) {
            console.warn(`No path provided for data: ${data}`);
            return;
        }

        const isItem = PathUtils.isItem(path);

        if (!isItem && this._data && this._data[Constants.CHILDREN_PROP]) {
            // Page data
            // @ts-ignore
            this._data[Constants.CHILDREN_PROP][path] = data;

            return;
        }

        // Item data
        const dataPaths = PathUtils.splitPageContentPaths(path);

        if (dataPaths && dataPaths.itemPath) {
            const pageData = this._getPageData(dataPaths.pagePath);
            const result = this._findItemData(dataPaths.itemPath, pageData);
            const parent = result.parent || pageData || this._data;
            const itemName = PathUtils.getNodeName(dataPaths.itemPath);

            if ((itemName != null) && parent && Object.prototype.hasOwnProperty.call(parent, Constants.ITEMS_PROP)) {
                const items = parent[Constants.ITEMS_PROP];

                if (items) {
                    items[itemName] = data;
                    const itemsOrder: string[] | undefined = parent[Constants.ITEMS_ORDER_PROP];

                    if ((itemsOrder != null) && (itemsOrder.length > 0) && (siblingName != null)) {
                        const index = itemsOrder.indexOf(siblingName);

                        if (index > -1) {
                            itemsOrder.splice(insertBefore ? index : (index + 1), 0, itemName);
                        } else {
                            itemsOrder.push(itemName);
                        }
                    }
                }
            }
        }
    }

    /**
     * Removes the data located at the provided location
     *
     * @param {string} path         - Path of the data
     * @return {string|null}   - Path to the parent item initially containing the removed data
     */
    public removeData(path: string): string | null {
        if (!path) {
            return null;
        }

        const isItem = PathUtils.isItem(path);

        if (!isItem && this._data && this._data[Constants.CHILDREN_PROP]) {
            // Page data
            // @ts-ignore
            delete this._data[Constants.CHILDREN_PROP][path];

            return null;
        }

        // Item data
        const dataPaths = PathUtils.splitPageContentPaths(path);

        if (dataPaths && dataPaths.itemPath) {
            const pageData = this._getPageData(dataPaths.pagePath);
            const result = this._findItemData(dataPaths.itemPath, pageData);

            if (result.data) {
                if (result && result.parent && Object.prototype.hasOwnProperty.call(result.parent, Constants.ITEMS_PROP)) {
                    const { parent } = result;
                    const items = parent[Constants.ITEMS_PROP];
                    const itemName = PathUtils.getNodeName(dataPaths.itemPath);

                    if (itemName) {
                        if (items) {
                            delete items[itemName];
                        }

                        delete result.data;
                        delete result.parent;

                        const itemsOrder: string[] | undefined = parent[Constants.ITEMS_ORDER_PROP];

                        if (itemsOrder && (itemsOrder.length > 0)) {
                            const index = itemsOrder.indexOf(itemName);
                            itemsOrder.splice(index, 1);
                            // parent[Constants.ITEMS_ORDER_PROP]?.splice(index, 1);
                        }

                        return result.parentPath ? result.parentPath : null;
                    }
                }
            }
        }

        console.warn(`Item for path ${path} was not found! Nothing to remove then.`);

        return null;
    }

    /**
     * @private
     */
    public destroy(): void {
        this._data = null;
        this._rootPath = null;
        this._pageContentDelimiter = null;

        delete this._data;
        delete this._rootPath;
        delete this._pageContentDelimiter;
    }

    /**
     * Retrieves the item and eventually returns the data wrapped with the parent information
     *
     * @param {string} path                 - Path of the item
     * @param {{}} [data=_data]             - Data to be explored (must not be null!)
     * @param {{}} [parent]                 - Parent data
     * @param {string} [parentPath='']      - Path of the parent data
     * @return {ItemWrapper}
     * @private
     */
    private _findItemData(path: string, data= this._data, parent: any = null, parentPath = ''): ItemWrapper {
        const answer: ItemWrapper = {
            parent,
            parentPath,
        };

        if (!data) {
            throw new Error('Assertion error: No data provided. This should never happen.');
        }

        const items: { [key: string]: Model } | undefined = data[Constants.ITEMS_PROP];

        if (!items) {
            return answer;
        }

        for (const pathKey in items) {
            if (!Object.prototype.hasOwnProperty.call(items, pathKey)) {
                continue;
            }

            const childItem: Model = items[pathKey];

            // Direct child. We reached the leaf
            if (pathKey === path) {
                answer.data = items[pathKey];
                answer.key = pathKey;

                return answer;
            } else {
                // Continue traversing
                let subPath = PathUtils.subpath(path, pathKey);

                if (this._pageContentDelimiter) {
                    const pageDelimiter = PathUtils._getStartStrings(subPath, this._pageContentDelimiter);
                    const childParentPath = PathUtils.join([parentPath, pathKey, pageDelimiter]);
                    subPath = PathUtils.trimStrings(subPath, this._pageContentDelimiter);

                    if (subPath !== path) {
                        const childItemWrapped: ItemWrapper = this._findItemData(subPath, childItem, childItem, childParentPath);

                        if (childItemWrapped) {
                            return childItemWrapped;
                        }
                    }
                } else {
                    throw new Error('_pageContentDelimiter not set. this should never happen as its set in constructor.');
                }
            }
        }

        return answer;
    }

    /**
     *
     * @param {string} pagePath - Path of the page
     *
     * @return {{}|undefined} - Data of the page
     * @private
     */
    private _getPageData(pagePath: string): Model | undefined {
        if (!this._data) {
            return;
        }

        if ((pagePath === '') || (pagePath === this._data[Constants.PATH_PROP]) || (pagePath === this.rootPath)) {
            return this._data;
        }

        const children = this._data[Constants.CHILDREN_PROP];

        return  children && children[pagePath];
    }
}
