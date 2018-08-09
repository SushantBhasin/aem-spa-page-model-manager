# Table of contents

  * [Installation](#installation)
  * [Usage](#usage)
  * [API](#api)
  * [Documentation](#documentation)
  * [Changelog](#changelog)


## Installation
```
npm install @adobe/cq-spa-page-model-manager@beta
```

## Usage

This module provides the API to manage the model representation of the pages that are composing a SPA.

```
import {PageModelManager} from '@adobe/cq-spa-page-model-manager';

// Initialization
PageModelManager.init("/content/mysite")
    .then(...);

// Loading of additional content
PageModelManager.getData({
    pagePath: "/content/mysite/myhiddenpage",
    dataPath: "root/my/component"
}).then(...); 
```

## API


### [@adobe/cq-spa-page-model-manager](https://www.adobe.com/go/aem6_4_docs_spa_en) *0.0.25-beta.0*



### src/Constants.js


    
#### Constants()

Useful variables for interacting with CQ/AEM components






##### Returns


- `Void`


    

    
#### TYPE_PROP()

Type of the item






##### Returns


- `Void`


    

    
#### ITEMS_PROP()

List of child items of an item






##### Returns


- `Void`


    

    
#### ITEMS_ORDER_PROP()

Order in which the items should be listed






##### Returns


- `Void`


    

    
#### PATH_PROP()

Path of an item






##### Returns


- `Void`


    

    
#### CHILDREN_PROP()

Children of a hierarchical item






##### Returns


- `Void`


    

    
#### HIERARCHY_TYPE_PROP()

Hierarchical type of the item






##### Returns


- `Void`


    


### src/EventType.js


    
#### EventType()

Type of events triggered or listened by the PageModelManager and ModelRouter






##### Returns


- `Void`


    

    
#### PAGE_MODEL_INIT()

Event which indicates that the PageModelManager has been initialized






##### Returns


- `Void`


    

    
#### PAGE_MODEL_LOADED()

Event which indicates that the PageModelManager has loaded new content






##### Returns


- `Void`


    

    
#### PAGE_MODEL_UPDATE()

Event that indicates a request to update the page model






##### Returns


- `Void`


    

    
#### PAGE_MODEL_ROUTE_CHANGED()

Event which indicates that ModelRouter has identified that model route has changed






##### Returns


- `Void`


    


### src/MetaProperty.js


    
#### MetaProperty()

Names of the meta properties associated with the PageModelProvider and ModelRouter






##### Returns


- `Void`


    


### src/PageModelManager.js


    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    
#### PageModelManager()

<p> The PageModelManager is responsible for centralizing, synchronizing and providing access to the model of the page.</p>
<p> It can also manage multiple pages; see {@link ModelRouter}.</p>

<h2>Configuration</h2>
<p>The PageModelManager can be configured using a meta tag in the head section of the document:</p>
<pre><code>e.g. &lt;meta property="cq:pagemodel_root_url" content="/content/test.model.json"\&gt;</code></pre>






##### Returns


- `Void`


    

    
#### init([cfg])

Initializes the page model manager with the model corresponding to the given page path.
It will fetch the corresponding page model from the server and later use the given page path as the root page path.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| cfg | `[object Object]`  | - Configuration object. | *Optional* |
| cfg.pagePath | `String`  | - Absolute path of the page (e.g., "/content/mypage"). If not provided, the root page path is used. | *Optional* |
| cfg.immutable&#x3D;true | `boolean`  | - Should the returned model be a copy | *Optional* |




##### Returns


- `Promise`  Promise resolved with the page model


    

    
#### getRootModelUrl()

Returns the path to the root model the page model manager has been initialized with






##### Returns


- `string`  


    

    
#### getData([cfg])

Extracts the data stored in the page model at the given path and returns a promise resolved with that data.
If the requested model isn't stored yet, it will try to load it from the server.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| cfg | `[object Object]`  | Configuration object. | *Optional* |
| cfg.pagePath | `String`  | Absolute path of the page (e.g., "/content/mypage"). If not provided, the root page path is used. | *Optional* |
| cfg.dataPath | `String`  | Relative path to the data in the page model (e.g., "root/mychild"). If not provided, the entire page model is extracted. | *Optional* |
| cfg.immutable&#x3D;true | `boolean`  | Should the returned model be a copy | *Optional* |
| cfg.forceReload&#x3D;false | `boolean`  | Should the page model be reloaded from the server | *Optional* |




##### Returns


- `Promise`  Promise resolved with the corresponding model data.


    

    
#### addListener([cfg])

Add the given callback as a listener for changes at the given path.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| cfg | `[object Object]`  | Configuration object. | *Optional* |
| cfg.pagePath | `String`  | Absolute path of the page (e.g., "/content/mypage"). If not provided, the root page path is used. | *Optional* |
| cfg.dataPath | `String`  | Relative path to the data in the page model (e.g., "root/mychild"). An empty string correspond to the model of the current path | *Optional* |
| cfg.callback | `String`  | Function to be executed listening to changes at given path | *Optional* |




##### Returns


- `Void`


    

    
#### removeListener([cfg])

Remove the callback listener from the given path path.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| cfg | `[object Object]`  | Configuration object. | *Optional* |
| cfg.pagePath | `String`  | Absolute path of the page (e.g., "/content/mypage"). If not provided, the root page path is used. | *Optional* |
| cfg.dataPath | `String`  | Relative path to the data in the page model (e.g., "root/mychild"). | *Optional* |
| cfg.callback | `String`  | Listener function to be removed. | *Optional* |




##### Returns


- `Void`


    



## Documentation 

The [technical documentation](https://www.adobe.com/go/aem6_4_docs_spa_en) is already available, but if you are unable to solve your problem or you found a bug you can always [contact us](https://www.adobe.com/go/aem6_4_support_en) and ask for help!

## Changelog 

## [Unreleased] - 0.0.25-beta.0

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

