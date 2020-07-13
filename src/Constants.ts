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
 * Useful variables for interacting with CQ/AEM components.
 *
 * @namespace Constants
 */
export class Constants {
    /**
     * Type of the item.
     */
    public static readonly TYPE_PROP = ':type';

    /**
     * List of child items of an item.
     */
    public static readonly ITEMS_PROP = ':items';

    /**
     * Order in which the items should be listed.
     */
    public static readonly ITEMS_ORDER_PROP = ':itemsOrder';

    /**
     * Path of an item.
     */
    public static readonly PATH_PROP = ':path';

    /**
     * Children of a hierarchical item.
     */
    public static readonly CHILDREN_PROP = ':children';

    /**
     * Hierarchical type of the item.
     */
    public static readonly HIERARCHY_TYPE_PROP = ':hierarchyType';

    /**
     * JCR content node.
     */
    public static readonly JCR_CONTENT = 'jcr:content';

    private constructor() {
        // hide constructor
    }
}

export default Constants;
