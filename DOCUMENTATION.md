
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


    

    

