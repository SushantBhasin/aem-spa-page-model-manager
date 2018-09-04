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
import Constants from "./Constants";
import InternalConstants from "./InternalConstants";
import MetaProperty from "./MetaProperty";

/**
 * Regexp used to extract the context path of a location.
 * The context path is extracted by assuming that the location starts with the context path followed by one of the following node names
 */
const CONTEXT_PATH_REGEXP = /^(.*)?(?:\/(?:content|conf|apps|libs|etc)\/.*)/g;

const JCR_CONTENT_PATTERN = '(.+)/' + Constants.JCR_CONTENT +'/(.+)';

/**
 * Helper functions related to path manipulation.
 *
 * @namespace PathUtils
 */
export class PathUtils {

    /**
     * Returns if the code executes in the browser context or not by checking for the
     * existance of the window object
     *
     * @returns {Boolean} the result of the check of the existance of the window object
     */
    static isBrowser() {
        try {
            return typeof window !== 'undefined';
        }catch(e){
            return false;
        }
    }

    /**
     * Returns the context path of the given location.
     * If no location is provided, it fallbacks to the current location.
     * @param {String} [location] - Location to be used to detect the context path from.
     * @returns {String}
     */
    static getContextPath(location) {
        location = location || this.getCurrentPathname();
        if (!location) {
            return "";
        }

        let matches = CONTEXT_PATH_REGEXP.exec(location);
        CONTEXT_PATH_REGEXP.lastIndex = 0;
        if (matches && matches[1]) {
            return matches[1];
        } else {
            return "";
        }
    }

    /**
     * Adapts the provided path to a valid model path.
     * Returns an empty string if the given path is equal to the root model path.
     * This function is a utility tool that converts a provided root model path into an internal specific empty path
     *
     * @param {string} [path]   - raw model path
     * @return {string} the valid model path
     *
     * @private
     */
    static adaptPagePath(path, rootPath) {
        if (!path) {
            return '';
        }

        if (!rootPath) {
            return path;
        }

        const localPath = PathUtils.internalize(path);
        const localRootModelPath = PathUtils.sanitize(rootPath);

        return localPath === localRootModelPath ? '' : localPath;
    }

    /**
     * Returns the given URL externalized by adding the optional context path
     *
     * @param {string} url - URL to externalize
     * @returns {string}
     */
    static externalize(url) {
        const contextPath = this.getContextPath();

        if (!contextPath || url.startsWith(contextPath)) {
            return url;
        }

        return contextPath + url;
    }

    /**
     * Returns the given URL internalized by removing the optional context path
     *
     * @param {string} url - URL to internalize
     * @returns {string}
     */
    static internalize(url) {
        if (!url) {
            return url;
        }

        const contextPath = this.getContextPath();

        // Does the path starts with a node
        if (url.startsWith(contextPath.endsWith('/') ? contextPath : contextPath + '/')) {
            return url.replace(contextPath, "");
        } else {
            return url;
        }
    }

    /**
     * Returns the value of the meta property with the given key
     *
     * @param {string} propertyName  - name of the meta property
     * @return {string|undefined}
     */
    static getMetaPropertyValue(propertyName) {
        if (this.isBrowser()) {
            const meta = document.head.querySelector('meta[property="' + propertyName + '"]');
            return meta && meta.content;
        }
    }

    /**
     * Returns a model path for the given URL
     *
     * @param {string} url - Raw URL for which to get a model URL
     * @return {string|undefined}
     */
    static convertToModelUrl(url) {
        return url && url.replace && url.replace(/\.htm(l)?$/, InternalConstants.DEFAULT_MODEL_JSON_EXTENSION);
    }

    /**
     * Returns the model URL as contained in the current page URL
     *
     * @return {string}
     */
    static getCurrentPageModelUrl() {
        // extract the model from the pathname
        return this.convertToModelUrl(this.getCurrentPathname());
    }

    /**
     * Returns the URL of the page model to initialize the page model manager with.
     * It is either derived from a meta tag property called 'cq:pagemodel_root_url' or from the given location.
     * If no location is provided, it derives it from the current location.
     *
     * @param {String} [url]   - path or URL to be used to derive the page model URL from
     * @returns {String}
     */
    static getModelUrl(url) {
        // Model path extracted from the given url
        if (url && url.replace) {
            return this.convertToModelUrl(url);
        }

        // model path from the meta property
        const metaModelUrl = this.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROOT_URL);

        if (metaModelUrl) {
            return metaModelUrl;
        }

        // Model URL extracted from the current page URL
        return this.getCurrentPageModelUrl();
    }

    /**
     * Returns the given path after sanitizing it.
     * This function should be called on page paths before storing them in the page model,
     * to make sure only properly formatted paths (e.g., "/content/mypage") are stored.
     * @param {string} path - Path of the page to be sanitized.
     * @return {string|undefined}
     */
    static sanitize(path) {
        if (!path) {
            return;
        }

        // Remove protocol, domain, port and keep only the path
        path = path.replace(
            /^[a-z]{4}:\/{2}[a-z]{1,}:[0-9]{1,4}(\/.*)/,
            "$1"
        );
        // Remove possible selectors
        let selectorIndex = path.indexOf(".");
        path = selectorIndex > -1 ? path.substr(0, selectorIndex) : path;
        // Remove possible context path
        path = this.internalize(path);

        return path;
    }

    /**
     * Returns the given path extended with the given extension.
     * @param {String} path - Path to be extended.
     * @param {String} extension - Extension to be added.
     * @returns {String}
     */
    static addExtension(path, extension) {
        if (!extension || extension.length < 1) {
            return path;
        }

        if (!extension.startsWith(".")) {
            extension = "." + extension;
        }

        if (!path || path.length < 1 || path.indexOf(extension) > -1) {
            return path;
        }

        let extensionPath = path;

        // Groups
        // 1. the resource
        // 2. the selectors and the extension
        // 3. the suffix
        // 4. the parameters
        let match = /^((?:[/a-zA-Z0-9:_-]*)+)(?:\.?)([a-zA-Z0-9._-]*)(?:\/?)([a-zA-Z0-9/._-]*)(?:\??)([a-zA-Z0-9=&]*)$/g.exec(
            path
        );
        let queue = "";

        if (match && match.length > 2) {
            // suffix
            queue = match[3] ? "/" + match[3] : "";
            // parameters
            queue += match[4] ? "?" + match[4] : "";

            extensionPath =
                match[1] +
                "." +
                match[2].replace(/\.htm(l)?/, extension) +
                queue;
        }

        return extensionPath.indexOf(extension) > -1
            ? extensionPath
            : extensionPath + extension + queue;
    }

    /**
     * Returns the given path extended with the given selector.
     * @param {String} path - Path to be extended.
     * @param {String} selector - Selector to be added.
     * @returns {String}
     */
    static addSelector(path, selector) {
        if (!selector || selector.length < 1) {
            return path;
        }

        if (!selector.startsWith(".")) {
            selector = "." + selector;
        }

        if (!path || path.length < 1 || path.indexOf(selector) > -1) {
            return path;
        }

        let index = path.indexOf(".") || path.length;

        if (index < 0) {
            return path + selector;
        }

        return path.slice(0, index) + selector + path.slice(index, path.length);
    }

    /**
     * Returns the current location as a string.
     * @returns {String}
     */
    static getCurrentPathname() {
        return this.isBrowser() ? window.location.pathname : undefined;
    }

    /**
     * Dispatches a custom event on the window object, when in the browser context
     *
     * @param  {String} eventName - the name of the custom event
     * @param {Object} options - the custom event options
     */
    static dispatchGlobalCustomEvent(eventName, options) {
        if (this.isBrowser()) {
            window.dispatchEvent(new CustomEvent(eventName, options));
        }
    }

    static join (paths) {
        return paths ? this.normalize(paths.filter((path) => path).join('/')) : "";
    }

    static normalize(path) {
        if (!path) return "";
        return path ? path.replace(/(\/+)/g, '/') : "";
    }

    static makeAbsolute(path) {
        if (!path || (typeof path !== "string")) return "";
        return path.startsWith('/') ? path : "/" + path;
    }

    static makeRelative(path) {
        if (!path || (typeof path !== "string")) return "";
        return path.startsWith('/') ? path.slice(1) : path;
    }

    static getParentNodePath(path) {
        const splashIndex = path.lastIndexOf('/') + 1;
        return path && typeof path === 'string' && splashIndex > 0 && splashIndex < path.length && path.substring(0, splashIndex - 1);
    }

    static isItem(path) {
        return new RegExp(JCR_CONTENT_PATTERN).test(path);
    }

    static getNodeName(path) {
        const splashIndex = path.lastIndexOf('/') + 1;
        return path && typeof path === 'string' && splashIndex < path.length && path.substring(splashIndex, path.length);
    }

    static subpath(targetPath, rootPath) {
        if (!targetPath) {
            return "";
        }

        let targetPathChildren = PathUtils.makeRelative(targetPath).split('/');
        let rootPathChildren = PathUtils.makeRelative(rootPath).split('/');

        if (targetPathChildren.length < rootPathChildren.length) {
            return targetPath;
        }

        let index;
        for(index = 0; index < rootPathChildren.length; ++index) {
            if (targetPathChildren[index] !== rootPathChildren[index]) {
                break;
            }
        }

        if (index === rootPathChildren.length) {
            return targetPathChildren.slice(index).join("/");
        } else {
            return targetPath;
        }
    }

    static splitByDelimitators(path, delimitators) {
        let paths = [path];
        delimitators.forEach((delimitator) => {
            let newPaths = [];
            let delim = PathUtils.normalize(PathUtils.makeAbsolute(delimitator) + "/");
            paths.forEach((path) => {
                newPaths = newPaths.concat(path.split(delim));
                if (path.endsWith(delimitator)) {
                    let lastPath = newPaths.splice(newPaths.length-1, 1)[0];
                    if (lastPath !== delimitator) {
                        newPaths = newPaths.concat(lastPath.split(PathUtils.makeAbsolute(delimitator)));
                    }
                }
                newPaths = newPaths.filter((path) => path);
            });
            paths = newPaths;
        });
        return paths;
    }

    static getJCRPath(pagePath, dataPath) {
        return pagePath + '/' + Constants.JCR_CONTENT + '/' + dataPath;
    }

    static splitPageContentPaths(path) {
        if (!path && typeof path !== 'string') {
            return;
        }

        const splitPaths = path.split('/' + Constants.JCR_CONTENT + '/');

        let split = {
            pagePath: splitPaths[0]
        };

        if (splitPaths.length > 1) {
            split.itemPath = splitPaths[1];
        }

        return split;
    }

    static trimStrings(path, strings) {
        strings.forEach((str) => {
            while(path.startsWith(str)) {
                path = PathUtils.makeRelative(path.slice(str.length));
            }

            while(path.endsWith(str)) {
                path = path.slice(0, path.length - str.length);
                if (path.endsWith('/')) {
                    path = path.slice(0, path.length - 1);
                }
            }
        });
        return path;
    }

    static getStartStrings(path, strings) {
        let returnStr = "";
        strings.forEach((str) => {
            while(path.startsWith(str)) {
                path = PathUtils.makeRelative(path.slice(str.length));
                returnStr = returnStr + "/" + str;
            }
        });
        return PathUtils.makeRelative(returnStr);
    }
}