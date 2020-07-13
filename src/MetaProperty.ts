/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2020 Adobe Systems Incorporated
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
 * Names of the meta properties associated with the PageModelProvider and ModelRouter
 *
 * @type {{PAGE_MODEL_ROOT_URL: string, PAGE_MODEL_ROUTE_FILTERS: string, PAGE_MODEL_ROUTER: string}}
 */
export class MetaProperty {
    /**
     * Meta property pointing to page model root.
     */
    public static readonly PAGE_MODEL_ROOT_URL = 'cq:pagemodel_root_url';

    /**
     * Meta property pointing to route filters.
     */
    public static readonly PAGE_MODEL_ROUTE_FILTERS = 'cq:pagemodel_route_filters';

    /**
     * Meta property pointing to model router.
     */
    public static readonly PAGE_MODEL_ROUTER = 'cq:pagemodel_router';

    private constructor() {
        // hide constructor
    }
}

export default MetaProperty;
