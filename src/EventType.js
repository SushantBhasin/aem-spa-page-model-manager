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

/**
 * Type of events triggered or listened by the PageModelManager and ModelRouter
 *
 * @type {{PAGE_MODEL_INIT: string, PAGE_MODEL_LOADED: string, PAGE_MODEL_UPDATE: string, PAGE_MODEL_ROUTE_CHANGED: string}}
 */
const EventType = {

    /**
     * Event which indicates that the PageModelManager has been initialized
     */
    PAGE_MODEL_INIT: 'cq-pagemodel-init',

    /**
     * Event which indicates that the PageModelManager has loaded new content
     */
    PAGE_MODEL_LOADED: 'cq-pagemodel-loaded',

    /**
     * Event that indicates a request to update the page model
     */
    PAGE_MODEL_UPDATE: 'cq-pagemodel-update',

    /**
     * Event which indicates that ModelRouter has identified that model route has changed
     */
    PAGE_MODEL_ROUTE_CHANGED: 'cq-pagemodel-route-changed'
};

export default EventType;