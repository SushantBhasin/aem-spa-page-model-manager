
### [@adobe/cq-spa-page-model-manager](https://www.adobe.com/go/aem6_4_docs_spa_en) *0.0.25-beta.3*



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


    


### src/EditorClient.js


    
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


    


### src/ModelClient.js


    
#### constructor([apiHost])






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| apiHost | `string`  | - Http host of the API | *Optional* |




##### Returns


- `Void`


    

    
#### fetch(path)

Fetches a model using the given a resource path




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path to the model | &nbsp; |




##### Returns


-  


    

    
#### destroy()

Destroys the internal references to avoid memory leaks






##### Returns


- `Void`


    


### src/ModelManager.js


    

    

    

    
#### new ModelManager()

The ModelManager gathers all the components implicated in managing the model data






##### Returns


- `Void`


    

    
#### ModelManager.modelClient()

Configuration object for the Initialization function





##### Properties

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |



##### Returns


- `Void`


    

    

    
#### ModelManager.initialize([config])

Initializes the ModelManager using the given path to resolve a data model.
If no path is provided, fallbacks are applied in the following order:

- meta property: cq:pagemodel_root_url
- current pathname of the browser

Once the initial model is loaded and if the data model doesn't contain the path of the current pathname, the library attempts to fetch a fragment of model.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| config | `string` `InitializationConfig`  | - Path to the data model or configuration object | *Optional* |




##### Returns


- `Promise`  


    

    

    
#### ModelManager.rootPath()

Returns the path of the data model root






##### Returns


- `string`  


    

    
#### ModelManager.getData(config)

Returns the model for the given configuration




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| config | `string` `GetDataConfig`  | - Either the path of the data model or a configuration object | &nbsp; |




##### Returns


- `Promise`  


    

    

    
#### ModelManager.addListener([path, callback])

Add the given callback as a listener for changes at the given path.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `String`  | Absolute path of the resource (e.g., "/content/mypage"). If not provided, the root page path is used. | *Optional* |
| callback | `String`  | Function to be executed listening to changes at given path | *Optional* |




##### Returns


- `Void`


    

    
#### ModelManager.removeListener([path, callback])

Remove the callback listener from the given path path.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `String`  | Absolute path of the resource (e.g., "/content/mypage"). If not provided, the root page path is used. | *Optional* |
| callback | `String`  | Listener function to be removed. | *Optional* |




##### Returns


- `Void`


    

    


### src/ModelStore.js


    
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


    

    
#### ModelStore.initialize(rootPath, data)

Initializes the the ModelManager




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| rootPath | `string`  | - Root path of the model | &nbsp; |
| data | `[object Object]`  | - Initial model | &nbsp; |




##### Returns


- `Void`


    

    
#### ModelStore.rootPath()

Returns the current root path






##### Returns


- `string`  


    

    

    

    
#### ModelStore.setData(path, newData)

Replaces the data in the given location




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path of the data | &nbsp; |
| newData | `[object Object]`  | - New data to be set | &nbsp; |




##### Returns


- `Void`


    

    
#### ModelStore.getData([path, immutable&#x3D;true])

Returns the data for the given path. If no path is provided, it returns the whole data




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path to the data | *Optional* |
| immutable&#x3D;true | `boolean`  | - Should the returned data be a clone | *Optional* |




##### Returns


-  


    

    
#### ModelStore.insertData(path, data[, siblingName, insertBefore&#x3D;false])

Insert the provided data at the location of the given path. If no sibling name is provided the data is added at the end of the list




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path to the data | &nbsp; |
| data | `[object Object]`  | - Data to be inserted | &nbsp; |
| siblingName | `string`  | - Name of the item before or after which to add the data | *Optional* |
| insertBefore&#x3D;false | `boolean`  | - Should the data be inserted before the sibling | *Optional* |




##### Returns


- `Void`


    

    
#### ModelStore.removeData(path)

Removes the data located at the provided location




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path of the data | &nbsp; |




##### Returns


- `string`  - Path to the parent item initially containing the removed data


    

    


### src/PathUtils.js


    
#### CONTEXT_PATH_REGEXP()

Regexp used to extract the context path of a location.
The context path is extracted by assuming that the location starts with the context path followed by one of the following node names






##### Returns


- `Void`


    

    
#### new PathUtils()

Helper functions related to path manipulation.






##### Returns


- `Void`


    

    
#### PathUtils.isBrowser()

Returns if the code executes in the browser context or not by checking for the
existance of the window object






##### Returns


- `Boolean`  the result of the check of the existance of the window object


    

    
#### PathUtils.getContextPath([location])

Returns the context path of the given location.
If no location is provided, it fallbacks to the current location.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| location | `String`  | - Location to be used to detect the context path from. | *Optional* |




##### Returns


- `String`  


    

    

    
#### PathUtils.externalize(url)

Returns the given URL externalized by adding the optional context path




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| url | `string`  | - URL to externalize | &nbsp; |




##### Returns


- `string`  


    

    
#### PathUtils.internalize(url)

Returns the given URL internalized by removing the optional context path




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| url | `string`  | - URL to internalize | &nbsp; |




##### Returns


- `string`  


    

    
#### PathUtils.getMetaPropertyValue(propertyName)

Returns the value of the meta property with the given key




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| propertyName | `string`  | - name of the meta property | &nbsp; |




##### Returns


- `string`  


    

    
#### PathUtils.convertToModelUrl(url)

Returns a model path for the given URL




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| url | `string`  | - Raw URL for which to get a model URL | &nbsp; |




##### Returns


- `string`  


    

    
#### PathUtils.getCurrentPageModelUrl()

Returns the model URL as contained in the current page URL






##### Returns


- `string`  


    

    
#### PathUtils.getModelUrl([url])

Returns the URL of the page model to initialize the page model manager with.
It is either derived from a meta tag property called 'cq:pagemodel_root_url' or from the given location.
If no location is provided, it derives it from the current location.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| url | `String`  | - path or URL to be used to derive the page model URL from | *Optional* |




##### Returns


- `String`  


    

    
#### PathUtils.sanitize(path)

Returns the given path after sanitizing it.
This function should be called on page paths before storing them in the page model,
to make sure only properly formatted paths (e.g., "/content/mypage") are stored.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `String`  | - Path of the page to be sanitized. | &nbsp; |




##### Returns


- `String`  


    

    
#### PathUtils.addExtension(path, extension)

Returns the given path extended with the given extension.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `String`  | - Path to be extended. | &nbsp; |
| extension | `String`  | - Extension to be added. | &nbsp; |




##### Returns


- `String`  


    

    
#### PathUtils.addSelector(path, selector)

Returns the given path extended with the given selector.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `String`  | - Path to be extended. | &nbsp; |
| selector | `String`  | - Selector to be added. | &nbsp; |




##### Returns


- `String`  


    

    
#### PathUtils.getCurrentPathname()

Returns the current location as a string.






##### Returns


- `String`  


    

    
#### PathUtils.dispatchGlobalCustomEvent(eventName, options)

Dispatches a custom event on the window object, when in the browser context




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| eventName | `String`  | - the name of the custom event | &nbsp; |
| options | `Object`  | - the custom event options | &nbsp; |




##### Returns


- `Void`


    

