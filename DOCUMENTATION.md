# [@adobe/cq-spa-page-model-manager](https://www.adobe.com/go/aem6_4_docs_spa_en) *0.0.20*



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


#### getRouteFilters()  *private method*

Returns the list of provided route filters






##### Returns


- `Array.&lt;string&gt;`  



#### isRouteExcluded(route)  *private method*

Should the route be excluded




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| route |  |  | &nbsp; |




##### Returns


- `boolean`  



#### isModelRouterEnabled()  *private method*

Is the model router enabled. Enabled by default






##### Returns


- `boolean`  



#### routeModel()  *private method*

Triggers the PageModelManager to fetch data based on the current route

Fires the @event 'cq-pagemodel-route-changed' with the root page model object






##### Returns


- `Void`



#### init()  *private method*

Initializes the model router event listeners if the router is enabled. Called on cq-pagemodel-init.






##### Returns


- `Void`




### src/PageModelManager.js


#### pageModelMap()  *private method*

Contains the different page model objects already loaded.
The initial page model is set via {@code PageModelManager#init}, and the additional ones can be set via {@code PageModelManager#getData}






##### Returns


- `Void`



#### listenersMap()  *private method*

Contains the different listeners registered against their corresponding paths.
The map has the following schematic structure: map(page path => map(data path => listener)). An empty data path string can be set to identify a page listener






##### Returns


- `Void`



#### getPageModelPath()  *private method*

Returns the path to the page model. Either it is derived from a meta tag property called 'cq:page_model_url' or from the current window location.






##### Returns


- `String`  



#### getListenersForPath(pagePath, dataPath)  *private method*

Returns the listeners corresponding to the given page path and data path.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pagePath |  | - Absolute path of the page corresponding to the page model. Defaults to {@code rootPagePath}. | &nbsp; |
| dataPath |  | - Relative path of the data in the page model. Defaults to empty string. | &nbsp; |




##### Returns


- `Array`  



#### notifyListeners(pagePath, dataPath)  *private method*

Execute the listeners corresponding to the given page and data paths.

If there are no listeners registered for the path the root element will be notified.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pagePath | `String`  | - Absolute path of the page corresponding to the page model. Defaults to {@code rootPagePath}. | &nbsp; |
| dataPath | `String`  | - Relative path of the data in the page model. Defaults to empty string. | &nbsp; |




##### Returns


- `Void`



#### triggerPageModelLoaded()  *private method*

Fires the @event 'cq-pagemodel-loaded' with the root page model object






##### Returns


- `Void`



#### extractModelRecursively(path, model)  *private method*

Recursively extracts the sub model at the given path




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `String`  | - Relative path to the sub model | &nbsp; |
| model | `[object Object]`  | - Parent model object | &nbsp; |




##### Returns


- `Void`



#### extractModel([dataPath], pageModel[, immutable&#x3D;true])  *private method*

Extracts the sub model data from the given data path.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| dataPath | `String`  | - Relative path to the data in the model | *Optional* |
| pageModel | `[object Object]`  | - Page model object | &nbsp; |
| immutable&#x3D;true | `boolean`  | - Indicates if the model should be returned as a copy by value. | *Optional* |




##### Returns


- `Promise`  Promise resolved with the model.



#### splitParentPath(path)  *private method*

Splits the path into parent path and the node name as key
If the path is '/A/B/C', it will return {'parent': '/A/B', 'key': 'C'}




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `String`  | - Path as a string | &nbsp; |




##### Returns


- `[object Object]`  Returns an object containing parent path mapped to 'parent' and key name mapped to 'key'



#### updateModel(msg)  *private method*

Updates the page model with the given data




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| msg | `Object`  | - Object containing the data to update the page model | &nbsp; |
| msg.path | `String`  | - Path in the PageModel which needs to be updated | &nbsp; |
| msg.cmd | `String`  | - Command Action requested via Editable on the content Node | &nbsp; |
| msg.data | `Object`  | - Data that needs to be updated in the PageModel at {path} | &nbsp; |




##### Returns


- `Void`



#### deletePath(pagePath, dataPath)  *private method*

Delete the data at given path in the page model




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pagePath | `String`  | - The path of the page corresponding to the page model to be updated | &nbsp; |
| dataPath | `String`  | - The path of the data in the page model to be updated | &nbsp; |




##### Returns


- `Promise`  



#### insertPath(pagePath, dataPath, data, insertBefore)  *private method*

Insert the new data structure before/after the given path in the Page Model




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pagePath | `String`  | - The path of the page corresponding to the page model to be updated | &nbsp; |
| dataPath | `String`  | - The path of the data in the page model to be updated | &nbsp; |
| data | `[object Object]`  | - The data object to be inserted | &nbsp; |
| insertBefore | `boolean`  | - Set to 'true' to insert new data before the path, 'false' otherwise | &nbsp; |




##### Returns


- `Promise`  



#### movePath(pagePath, dataPath, data, insertBefore)  *private method*

Move data from {path} to {data.key} before/after {data.sibling}




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pagePath | `String`  | - The path of the page corresponding to the page model to be updated | &nbsp; |
| dataPath | `String`  | - The path of the data in the page model to be moved | &nbsp; |
| data | `[object Object]`  |  | &nbsp; |
| data.key | `String`  | - The key of the data to be moved | &nbsp; |
| data.sibling | `[object Object]`  | - The sibling of the data to be moved | &nbsp; |
| insertBefore | `boolean`  | - Set to 'true' to move data before {data.sibling}, 'false' otherwise | &nbsp; |




##### Returns


- `Promise`  



#### storePageModel([pagePath], pageModel)  *private method*

Adds a page to the {@link pageModelMap}. Either the page is the page model or the page is a child page of the root page




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pagePath | `String`  | - absolute path of the page resource | *Optional* |
| pageModel | `[object Object]`  | - model of the page to be added | &nbsp; |




##### Returns


- `Void`



#### setData(pagePath, dataPath, newData)  *private method*

Set new data at the given path in the page model




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pagePath | `String`  | - The path of the page corresponding to the page model to be updated | &nbsp; |
| dataPath | `String`  | - The path of the data in the page model to be set | &nbsp; |
| newData | `Object`  | - The new data object to be set | &nbsp; |




##### Returns


- `Promise`  



#### addExtension(path, extension)  *private method*

Returns the provided path extended with the provided extension




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - path to be extended | &nbsp; |
| extension | `string`  | - extension to be added | &nbsp; |




##### Returns


- `string`  



#### addSelector(path, selector)  *private method*

Returns the provided path extended with the provided selector




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - path to be extended | &nbsp; |
| selector | `string`  | - selector to be added | &nbsp; |




##### Returns


- `string`  



#### fetchModel(path)  *private method*

Fetch the page model from the server




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path |  | - The path of the corresponding page | &nbsp; |




##### Returns


- `Promise`  Returns a promise resolved with the page model object



#### PageModelManager() 

<p> The PageModelManager is responsible for centralizing, synchronizing and providing access to the model of the page.</p>
<p> It can also manage multiple pages; see {@link ModelRouter}.</p>

<h2>Configuration</h2>
<p>The PageModelManager can be configured using meta tags and properties located in the head section of the document.</p>

e.g. &lt;meta property="name" content="value"\&gt;





##### Properties

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |



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




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
