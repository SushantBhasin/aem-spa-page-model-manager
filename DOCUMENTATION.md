
### [@adobe/cq-spa-page-model-manager](https://www.adobe.com/go/aem6_4_docs_spa_en) *0.0.22*



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


    

