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
import EventType from './EventType';
import Helpers from "./Helpers";
import MetaProperty from "./MetaProperty";

/**
 * Triggered by the ModelRouter when the route has changed.
 *
 * @event cq-pagemodel-route-changed
 * @type {Object}
 * @property {Object} detail
 * @property {Object} detail.model - The page model object corresponding to the new route
 */

/**
 * <p>The ModelRouter listens for HTML5 History API <i>popstate</i> events and calls {@link PageModelManager#getData()} with the model path it extracted from the URL.</p>
 *
 * <h2>Configuration</h2>
 *
 * <p>The Model Router can be configured using meta properties located in the head section of the document.</p>
 *
 * <h3>Meta properties</h3>
 * <ul>
 *     <li>cq:page_model_router - default=undefined, options=disable</li>
 *     <li>cq:page_model_route_filters - default=undefined, options=RegExp<></li>
 * </ul>
 *
 * <h3>Defaults</h3>
 * <ul>
 *     <li>The ModelRouter is enabled and uses the <i>History</i> API to extract the model path from the current content path</li>
 * </ul>
 *
 * <h3>Examples and Usages</h3>
 *
 * <h4>Disables the page model router</h4>
 * <pre>
 *     <code>e.g. &lt;meta property="cq:page_model_router" content="disable"\&gt;</code>
 * </pre>
 *
 * <h4>Filters paths from the model routing with the given patterns</h4>
 * <pre>
 *     <code>e.g. &lt;meta property="cq:page_model_route_filters" content="route/not/found,^(.*)(?:exclude/path)(.*)"\&gt;</code>
 * </pre>
 *
 * @module ModelRouter
 */

/**
 * Modes in which the Model Router operates
 *
 * @type {{DISABLED: string, CONTENT_PATH: string}}
 */
const ROUTER_MODES = {

    /**
     * Flag that indicates that the model router should be disabled
     *
     * @type {string}
     */
    DISABLED: 'disabled',

    /**
     * Flag that indicates that the model router should extract the model path from the content path section of the URL
     *
     * @type {string}
     */
    CONTENT_PATH: 'path'
};

/**
 * Returns the model path. If no URL is provided the current window URL is used
 *
 * @param {string} [url]    - url from which to extract the model path
 *
 * @return {string}
 */
function getModelPath(url) {
    let localUrl;

    localUrl = url || window.location.pathname;

    // The default value model path comes as the the content path
    let endPosition = localUrl.indexOf('.');

    if (endPosition < 0) {
        endPosition = localUrl.length;
    }

    return localUrl.substr(0, endPosition);
}

/**
 * Returns the list of provided route filters
 *
 * @returns {string[]}
 *
 * @private
 */
function getRouteFilters() {
    let routeFilters = Helpers.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROUTE_FILTERS);
    return routeFilters ? routeFilters.split(',') : [];
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
    const modelRouterMetaType = Helpers.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROUTER);
    // Enable the the page model routing by default
    return !modelRouterMetaType || ROUTER_MODES.DISABLED !== modelRouterMetaType;
}

/**
 * Fetches the model from the PageModelManager and then dispatches it
 *
 * @fires cq-pagemodel-route-changed
 *
 * @param {string} [path]   - path of the model to be dispatched
 *
 * @private
 */
function dispatchRouteChanged(path) {
    // Triggering the page model manager to load a new child page model
    // No need to use a cache as the PageModelManager already does it
    PageModelManager.getData({pagePath: path}).then(function (model) {
        window.dispatchEvent(new CustomEvent(EventType.PAGE_MODEL_ROUTE_CHANGED, {
            detail: {
                model: model
            }
        }));
    });
}

/**
 * Triggers the PageModelManager to fetch data based on the current route
 *
 * @fires cq-pagemodel-route-changed - with the root page model object
 *
 * @param {string} [url]    - url from which to extract the model path
 *
 * @private
 */
function routeModel(url) {
    if (!isModelRouterEnabled()) {
        return;
    }

    const path = getModelPath(url);


    // don't fetch the model
    // for the root path
    // or when the route is excluded
    if (!path || '/' === path || isRouteExcluded(path)) {
        return;
    }

    dispatchRouteChanged(path);
}

/**
 * When the PageModelManager is initialized, fetch and dispatch the complete model object
 *
 * @private
 */
function onPageInit() {
    if (!isModelRouterEnabled()) {
        return;
    }

    dispatchRouteChanged();
}

// Activate the model router
if (isModelRouterEnabled()) {
    window.addEventListener(EventType.PAGE_MODEL_INIT, onPageInit, false);

    // Encapsulate the history.pushState and history.replaceState functions to prefetch the page model for the current route
    const pushState = window.history.pushState;
    const replaceState = window.history.replaceState;

    window.history.pushState = function(state, title, url) {
        routeModel(url);

        return pushState.apply(history, arguments);
    };

    window.history.replaceState = function(state, title, url) {
        routeModel(url);

        return replaceState.apply(history, arguments);
    };
}

