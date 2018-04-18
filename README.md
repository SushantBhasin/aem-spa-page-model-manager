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


### [@adobe/cq-spa-page-model-manager](https://www.adobe.com/go/aem6_4_docs_spa_en) *0.0.20*



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


    

    
#### PAGE_PATH_PROP()

Path of a page






##### Returns


- `Void`


    

    
#### PAGES_PROP()

List of child pages of an page






##### Returns


- `Void`


    


### src/ModelRouter.js


    

    

    

    

    


### src/PageModelManager.js


    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    
#### PageModelManager()

<p> The PageModelManager is responsible for centralizing, synchronizing and providing access to the model of the page.</p>
<p> It can also manage multiple pages; see {@link ModelRouter}.</p>

<h2>Configuration</h2>
<p>The PageModelManager can be configured using a meta tag in the head section of the document:</p>
<pre><code>e.g. &lt;meta property="cq:page_model_url" content="/content/test.model.json"\&gt;</code></pre>






##### Returns


- `Void`


    

    
#### init([pagePath])

Initializes the page model manager with the model corresponding to the given page path.
It will fetch the corresponding page model from the server and later use the given page path as the root page path.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pagePath | `String`  | Path (absolute path) of the page to be managed. Defaults to the cq:page_model_url meta. | *Optional* |




##### Returns


- `Promise`  Promise resolved with the page model (copy).


    

    
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

### v0.0.20 - 17 April 2018

Initial public release of cq-spa-page-model-manager, which provides:
 * Updated `PageModelManager` API, now able to manage the model of multiple pages stored in AEM:
    * `getData()`, `addListeners()` and `removeListeners()` expect a config parameter that specifies the `pagePath` and `dataPath`
    * `getData()` supports a `forceReload` parameter
    * `cq-pagemodel-update` event listener expects `pagePath` and `dataPath` in the event data object
 * New `ModelRouter`, which reacts to hash changes and triggers the reload of the corresponding model asynchronously
    * `cq-pagemodel-route-changed` event indicates route changes after successful model update



