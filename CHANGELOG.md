### *1.0.0* - 28 September 2018

 * **BREAKING CHANGE** API refactoring for a better modularization
 * **BREAKING CHANGE** SSR refactoring
    * Added support for setting apiHost, in order to force absolute url requests on Node server
    * Added support for initializing with an existing model. This is useful when we initialize in the client, the state from the server.
    * Guarding for dispatching & listening events only in browser context. 
    * Fixed race conditions with `init` method when called from `getData`

### Removed

 * unnecessary and misleading event triggering resulting in the Page Editor not to have overlays

## 0.0.24 - 22 June 2018

Public release of `cq-spa-page-model-manager`, which provides:

* support for context path
* **BREAKING CHANGE** change routing method to support History API by default (hash routing support has been removed)

## 0.0.23 - 15 May 2018

Public release of `cq-spa-page-model-manager`, which provides:

 * Support for the latest version of the `com.adobe.cq.export.json.hierarchy` API
    * Support and usage of the `:path` and `:children` fields to identify a page and its child pages
 * Support for URLs containing a context path
    * The `PageModelManager` can now be used in conjunction with URLs including a context path

## 0.0.22 - 20 April 2018

Initial public release of `cq-spa-page-model-manager`, which provides:
 * Updated `PageModelManager` API, now able to manage the model of multiple pages stored in AEM:
    * `getData()`, `addListeners()` and `removeListeners()` expect a config parameter that specifies the `pagePath` and `dataPath`
    * `getData()` supports a `forceReload` parameter
    * `cq-pagemodel-update` event listener expects `pagePath` and `dataPath` in the event data object
 * New `ModelRouter`, which reacts to hash changes and triggers the reload of the corresponding model asynchronously
    * `cq-pagemodel-route-changed` event indicates route changes after successful model update