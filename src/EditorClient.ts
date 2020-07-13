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
import EventType from './EventType';
import { ModelManager } from './ModelManager';
import { PathUtils } from './PathUtils';

/**
 * Broadcast an event to indicate the page model has been loaded
 *
 * @param {{}} model - model item to be added to the broadcast payload
 * @fires cq-pagemodel-loaded
 */
export function triggerPageModelLoaded(model: any): void {
    // Deep copy to protect the internal state of the page mode
    PathUtils.dispatchGlobalCustomEvent(EventType.PAGE_MODEL_LOADED, {
        detail: {
            model: clone(model)
        }
    });
}

/**
 * The EditorClient is responsible for the interactions with the Page Editor.
 */
export class EditorClient {
    public _modelManager: ModelManager;
    public _windowListener: EventListenerOrEventListenerObject;

    constructor(ModelManager: ModelManager) {
        this._modelManager = ModelManager;

        this._windowListener = (event: any) => {
            if (!event || !event.detail || !event.detail.msg) {
                console.error('EditorService.js', 'No message passed to cq-pagemodel-update', event);
                return;
            }

            this._updateModel(event.detail.msg);
        };

        if (PathUtils.isBrowser()) {
            window.addEventListener(EventType.PAGE_MODEL_UPDATE, this._windowListener);
        }
    }

    /**
     * Updates the page model with the given data
     *
     * @param {Object} msg - Object containing the data to update the page model
     * @property {String} msg.dataPath - Relative data path in the PageModel which needs to be updated
     * @property {String} msg.pagePath - Absolute page path corresponding to the page in the PageModel which needs to be updated
     * @param {String} msg.cmd - Command Action requested via Editable on the content Node
     * @param {Object} msg.data - Data that needs to be updated in the PageModel at {path}
     * @fires cq-pagemodel-loaded
     * @private
     */
    public _updateModel(msg: any) {
        if (!msg || !msg.cmd || !msg.path) {
            console.error('PageModelManager.js', 'Not enough data received to update the page model');
            return;
        }

        // Path in the PageModel which needs to be updated
        const path = msg.path;

        // Command Action requested via Editable on the content Node
        const cmd = msg.cmd;

        // Data that needs to be updated in the page model at the given path
        const data = clone(msg.data);

        let siblingName;
        let itemPath;
        let insertBefore;
        const parentNodePath = PathUtils.getParentNodePath(path);

        switch (cmd) {
            case 'replace':
                this._modelManager.modelStore.setData(path, data);
                this._modelManager._notifyListeners(path);
                break;

            case 'delete':
                this._modelManager.modelStore.removeData(path);

                if (parentNodePath) {
                    this._modelManager._notifyListeners(parentNodePath);
                }

                break;

            case 'insertBefore':
                insertBefore = true;
                // No break as we want both insert command to be treated the same way
                // eslint-disable-next-line no-fallthrough

            case 'insertAfter':
                // The logic relative to the item path and sibling between the editor and the ModelManager is reversed
                // Adapting the command to the ModelManager API
                siblingName = PathUtils.getNodeName(path);

                if (parentNodePath) {
                    itemPath = parentNodePath + '/' + data.key;
                    this._modelManager.modelStore.insertData(itemPath, data.value, siblingName, insertBefore);
                    this._modelManager._notifyListeners(parentNodePath);
                }

                break;

            default:
                // 'replaceContent' command not supported
                // 'moveBefore', 'moveAfter' commands not supported.
                // As instead, we are replacing source and destination parents because they can contain data about the item we want to relocate
                console.log('EditorClient', 'unsupported command:', cmd);
        }

        triggerPageModelLoaded(this._modelManager.modelStore.dataMap);
    }

    /**
     * @private
     */
    public destroy() {
        delete this._modelManager;

        if (PathUtils.isBrowser()) {
            window.removeEventListener(EventType.PAGE_MODEL_UPDATE, this._windowListener);
        }
    }
}
