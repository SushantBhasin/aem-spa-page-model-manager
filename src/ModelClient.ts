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

import { Model } from './Model';

export class ModelClient {
    private _apiHost: string | null;
    private _fetchPromises: { [key: string]: Promise<Model> } | null;

    /**
     * @constructor
     * @param {string} [apiHost] - Http host of the API
     */
    constructor(apiHost?: string) {
        this._apiHost = apiHost || '';
        this._fetchPromises = {};
    }

    /**
     * Fetches a model using the given a resource path.
     *
     * @param {string} modelPath - Absolute path to the model.
     * @return {*}
     */
    public fetch<M extends Model>(modelPath: string): Promise<M> {
        if (!modelPath) {
            const err = `Fetching model rejected for path: ${modelPath}`;
            return Promise.reject(new Error(err));
        }

        // Either the API host has been provided or we make an absolute request relative to the current host
        const apihostPrefix = this._apiHost || '';
        const url = `${apihostPrefix}${modelPath}`;

        // Assure that the default credentials value ('same-origin') is set for browsers which do not set it
        // or which are setting the old default value ('omit')
        return fetch(url, {credentials: 'same-origin'}).then((response) => {
            if ((response.status >= 200) && (response.status < 300)) {
                return response.json() as Promise<M>;
            }

            throw { response };
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    /**
     * Destroys the internal references to avoid memory leaks.
     */
    public destroy() {
        this._apiHost = null;
        this._fetchPromises = null;
    }
}
