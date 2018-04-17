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
import PageModelManager from './PageModelManager';

/**
 * Triggered by the ModelRouter when the route has changed.
 *
 * @event cq-pagemodel-route-changed
 * @type {Object}
 * @property {Object} detail
 * @property {Object} detail.model - The page model object corresponding to the new route
 */

/**
 * <p>The ModelRouter listens for URL hash and history changes and triggers {@link PageModelManager#getData()} with the current hash value.</p>
 *
 * <h2>Configuration</h2>
 * <p>The Model Router can be configured using meta tags and properties located in the head section of the document.</p>
 *
 * e.g. &lt;meta property="name" content="value"\&gt;
 *
 * @module ModelRouter
 * @property {boolean} [cq:page_model_router]              - [Meta property] (boolean) indicating if the ModelRouter be enabled
 * @property {string[]} [cq:page_model_route_filters]      - [Meta property] (array of regex) indicating  the filters to be tested against hash changes
 */

/**
 * Returns the list of provided route filters
 *
 * @returns {string[]}
 *
 * @private
 */
function getRouteFilters() {
    let routeFilters = document.head.querySelector('meta[property="cq:page_model_route_filters"]');

    return routeFilters && routeFilters.content ? routeFilters.content.split(',') : [];
}

/**
 * Should the route be excluded
 *
 * @param route
 * @returns {boolean}
 *
 * @private
 */
function isRouteExcluded(route) {
    const routeFilters = getRouteFilters();

    for (let i = 0, length = routeFilters.length; i < length; i++) {
        if (new RegExp(routeFilters[i]).test(route)) {
            return true;
        }
    }

    return false;
}

/**
 * Is the model router enabled. Enabled by default
 * @returns {boolean}
 *
 * @private
 */
function isModelRouterEnabled() {
    const modelRouterMeta = document.head.querySelector('meta[property="cq:page_model_router"]');
    // Enable the the page model routing by default
    return !modelRouterMeta || 'false' !== modelRouterMeta.content;
}

/**
 * Triggers the PageModelManager to fetch data based on the current route
 *
 * Fires the @event 'cq-pagemodel-route-changed' with the root page model object
 *
 * @fires cq-pagemodel-route-changed

 * @private
 */
function routeModel() {
    if (!isModelRouterEnabled()) {
        return;
    }

    const path = window.location.hash.replace('#', '');

    // don't fetch the model
    // for the root path
    // or when the route is excluded
    if (!path || '/' === path || isRouteExcluded(path)) {
        return;
    }

    // Triggering the page model manager to load a new child page model
    // No need to use a cache as the PageModelManager already does it
    PageModelManager.getData({pagePath: path}).then(function (model) {
        window.dispatchEvent(new CustomEvent('cq-pagemodel-route-changed', {
            detail: {
                model: model
            }
        }));
    });
}

/**
 * Initializes the model router event listeners if the router is enabled. Called on cq-pagemodel-init.
 *
 * @private
 */
function init () {
    if (!isModelRouterEnabled()) {
        return;
    }

    routeModel();

    window.addEventListener('hashchange', routeModel, false);
    window.addEventListener('popstate', routeModel, false);
}

window.addEventListener('cq-pagemodel-init', init, false);
