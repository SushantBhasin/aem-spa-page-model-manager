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
  * Generic Model interface.
  * Marks common properties that pages / items have.
  */
export interface Model extends Object {
    /**
     * Hierarchy type.
     */
    ':hierarchyType'?: string;

    /**
     * Path of the item/page.
     */
    ':path'?: string;

    /**
     * Child pages (only present on page's itself, not on items).
     */
    ':children'?: { [key: string]: Model };

    /**
     * Items under the page/item.
     */
    ':items'?: { [key: string]: Model };

    /**
     * Order of the items under the page/item.
     * Can be used as keys for the :items property to iterate items in the proper order.
     */
    ':itemsOrder'?: string[];

    /**
     * Resource type of the page/item.
     */
    ':type'?: string;
}
