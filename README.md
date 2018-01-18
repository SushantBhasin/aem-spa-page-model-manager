# spa-page-model-manager

## Usage

### Documentation

#### fetchModel(path) → Promise

Fetch the Page Model from the server.

###### Parameters
|Name|	Type|	Description|
| --- | ---- | --- |
|path|	string||	

###### Fires
`Window#event:cq-pagemodel-loaded`

#### getData(pathopt, deepCopyopt)

Extracts the data stored in the pageModel at the given path and returns a Promise resolved by that data

###### Parameters
|Name|Type|Attributes|Description|
| --- | --- | --- | --- |
|path|	string|	\<optional\>|Path to the child item|
|deepCopy|	boolean|	\<optional\>|Should a deep copy be made returns `Promise`|

#### setData(path, newData) → Promise

Set newData at the given path in the PageModel

###### Parameters
|Name|	Type|	Description|
| --- | --- | --- |
|path|	string|	Path in the PageModel at which to set new data|
|newData|	Object|	New Data Object to be set|

#### addListener(path, callback)

Add `callback` as a listener for changes at `path`

###### Parameters
|Name|	Type|	Description|
| --- | --- | --- |
|path|	string|	Path|
|callback|	function|	Function to be executed listening to changes at given path|

#### removeListener(path, callback)

Remove `callback` listener from `path`

###### Parameters
|Name|	Type|	Description|
| --- | --- | --- |
|path|	string|	Path|
|callback|	function|	Listener function to be removed from path|


## Development

Run `npm install` to get all node_modules that are necessary for development.

### Build

```sh
$ npm run build
```

### Test

```sh
$ npm run test
```
or
```sh
$ npm run test-debug
```

### Generate docs

```sh
$ npm run docs
```
The documents will be generated in the `/out` folder