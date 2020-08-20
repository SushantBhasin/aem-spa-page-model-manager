# Table of contents

  * [Installation](#installation)
  * [Usage](#usage)
  * [API](#api)
  * [Documentation](#documentation)
  * [Changelog](#changelog)


## Installation
```
npm install @adobe/cq-spa-page-model-manager
```

## Usage

This module provides the API to manage the model representation of the pages that are composing a SPA.

```
// index.html

<head>
...
    <meta property="cq:pagemodel_root_url" content="... .model.json"/>
...
</head>
...

// Bootstrap: index.js
import { ModelManager } from '@adobe/cq-spa-page-model-manager';

ModelManager.initialize().then((model) => {
    // Render the App content using the provided model
    render(model);
});

// Loading a specific portion of model
ModelManager.getData("/content/site/page/jcr:content/path/to/component").then(...); 
```

## API


### [@adobe/cq-spa-page-model-manager](https://www.adobe.com/go/aem6_4_docs_spa_en) *1.2.0*



### src/Constants.ts


    
#### new Constants()

Useful variables for interacting with CQ/AEM components.






##### Returns


- `Void`


    


### src/EventType.ts


    
#### new EventType()

Type of events triggered or listened by the PageModelManager and ModelRouter






##### Returns


- `Void`


    


### src/EditorClient.ts


    
#### triggerPageModelLoaded(model)

Broadcast an event to indicate the page model has been loaded




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| model | `[object Object]`  | - model item to be added to the broadcast payload | &nbsp; |




##### Returns


- `Void`


    

    
#### new EditorClient()

The EditorClient is responsible for the interactions with the Page Editor.






##### Returns


- `Void`


    


### src/ModelClient.ts


    
#### constructor([apiHost])






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| apiHost | `string`  | - Http host of the API | *Optional* |




##### Returns


- `Void`


    


### src/ModelRouter.ts


    
#### new RouterModes()

Modes in which the Model Router operates






##### Returns


- `Void`


    

    
#### getModelPath([url])

Returns the model path. If no URL is provided the current window URL is used




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| url | `string`  | - url from which to extract the model path | *Optional* |




##### Returns


- `string`  


    

    

    

    

    

    


### src/MetaProperty.ts


    
#### new MetaProperty()

Names of the meta properties associated with the PageModelProvider and ModelRouter






##### Returns


- `Void`


    


### src/ModelStore.ts


    
#### new ModelStore()

The ModelStore is in charge of providing access to the data model. It provides the CRUD operations over the model.
To protect the integrity of the data it initially returns immutable data. If needed, you can request a mutable object.






##### Returns


- `Void`


    

    
#### ModelStore.constructor([rootPath, data])






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| rootPath | `string`  | - Root path of the model | *Optional* |
| data | `[object Object]`  | - Initial model | *Optional* |




##### Returns


- `Void`


    


### src/PathUtils.ts


    
#### CONTEXT_PATH_REGEXP()

Regexp used to extract the context path of a location.
The context path is extracted by assuming that the location starts with the context path followed by one of the following node names






##### Returns


- `Void`


    

    
#### new PathUtils()

Helper functions related to path manipulation.






##### Returns


- `Void`


    


### src/ModelManager.ts


    

    



## Documentation 

The [technical documentation](https://www.adobe.com/go/aem6_4_docs_spa_en) is already available, but if you are unable to solve your problem or you found a bug you can always [contact us](https://www.adobe.com/go/aem6_4_support_en) and ask for help!

## Changelog 

### *1.2.0* - 20 August 2020
* Codebase change to TypeScript

### *1.1.3* - 5 June 2020
* Support Launches content paths

### *1.1.2* - 19 May 2020
* Do not fetch excluded routes on model manager initialization

### *1.1.1* - 17 January 2020
* Fixed:
    * Page crashes on link containing query parameter without html extension

### *1.1.0* - 19 December 2019

* Improve URL sanitizing behavior for `model.json` requests
* Make `clone` a dependency instead of a peer dependency
* Remove optional dependencies

### *1.0.7* - 4 April 2019

* no functional changes

### *1.0.6* - 6 March 2019

* ModelManager#initialze to consistently return the same type of object
* ModelManager#initialze to fire a cq-pagemodel-loaded event

### *1.0.5* - 12 December 2018

* ModelClient fetch: added default credentials for the request

### *1.0.4* - 9 November 2018

* support path ending the jcr:content when getting the data from the ModelStore

### *1.0.3* - 11 October 2018

* Un-found remote model entry point rejection handling
* README update

### *1.0.1* - 28 September 2018

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

