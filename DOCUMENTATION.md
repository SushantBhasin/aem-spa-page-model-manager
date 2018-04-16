# [@adobe/cq-spa-page-model-manager](https://www.adobe.com/go/aem6_4_docs_spa_en) *0.0.19*



### src/PageModelManager.js


#### listeners()  *private method*

Map of paths and their registered listeners






##### Returns


- `Void`



#### getPageModelPath() 

Returns the url to the page model. Either it is set via a meta tag property called 'cq:page_model_url' or it falls back to '{path/to/page}.model.json'






##### Returns


- `string`  



#### notifyListeners(path)  *private method*

Call listeners on the given path




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path | &nbsp; |




##### Returns


- `Void`



#### triggerPageModelLoaded()  *private method*

Fires the @event 'cq-pagemodel-loaded' with the needed data






##### Returns


- `Void`



#### getModelChild(path, model)  *private method*

Returns the child Model at the given path from the given PageModel




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | Path to the child object | &nbsp; |
| model | `[object Object]`  | Parent model object | &nbsp; |




##### Returns


- `Void`



#### resolveModel([path], pageModel, resolveFnc[, immutable&#x3D;true])  *private method*

Resolves the model for the given path




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | Path to the child item | *Optional* |
| pageModel | `[object Object]`  | Model of the page | &nbsp; |
| resolveFnc | `function`  | Function to be called with the resolved model | &nbsp; |
| immutable&#x3D;true | `boolean`  | Should a returned pageModel be a copy | *Optional* |




##### Returns


- `Void`



#### splitParentPath(path)  *private method*

Splits the path into parent path and the node name as key
If the path is '/A/B/C', it will return {'parent': '/A/B', 'key': 'C'}




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path string | &nbsp; |




##### Returns


- `[object Object]`  Returns an Object containing parent path mapped to 'parent'               and key name mapped to 'key'



#### updateModel(msg)  *private method*

Updates the PageModel with the provided data




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| msg | `UpdateEvent.detail.msg`  | - Object containing the data to update the PageModel | &nbsp; |




##### Returns


- `Void`



#### deletePath(path)  *private method*

Delete data at given path from the Page Model




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  |  | &nbsp; |




##### Returns


- `Promise`  



#### insertPath(path, data, insertBefore)  *private method*

Insert the new data structure before/after the given path in the Page Model




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - The path in the Page Model to be updated | &nbsp; |
| data | `[object Object]`  | - New Data Object to be set | &nbsp; |
| insertBefore | `boolean`  | - 'true' to insert new data before the path, 'false' otherwise | &nbsp; |




##### Returns


- `Promise`  



#### movePath(path, data, insertBefore)  *private method*

Move data from {path} to {data.key} before/after {data.sibling}




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - The path from where the data has to be moved | &nbsp; |
| data | `[object Object]`  |  | &nbsp; |
| insertBefore | `boolean`  | - Set to 'true' to move data before {data.sibling}, 'false' otherwise | &nbsp; |




##### Returns


- `Promise`  



#### setData(path, newData) 

Set newData at the given path in the PageModel




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path in the PageModel at which to set new data | &nbsp; |
| newData | `Object`  | - New Data Object to be set | &nbsp; |




##### Returns


- `Promise`  



#### PageModelManager() 

The {@code PageModelManager} is responsible for centralizing, synchronizing and providing access to the model of the page






##### Returns


- `Void`



#### init(path) 

Fetch the Page Model from the server.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  |  | &nbsp; |




##### Returns


- `Promise`  Promise resolved by PageModel



#### getData([path, immutable&#x3D;true]) 

Extracts the data stored in the pageModel at the given path and returns a Promise
resolved by that data




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | Path to the child item | *Optional* |
| immutable&#x3D;true | `boolean`  | Should a returned pageModel be a copy returns {Promise} | *Optional* |




##### Returns


- `Void`



#### addListener(path, callback) 

Add {callback} as a listener for changes at {path}




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path | &nbsp; |
| callback | `Function`  | - Function to be executed listening to changes at given path | &nbsp; |




##### Returns


- `Void`



#### removeListener(path, callback) 

Remove {callback} listener from {path}




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| path | `string`  | - Path | &nbsp; |
| callback | `Function`  | - Listener function to be removed from path | &nbsp; |




##### Returns


- `Void`




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
