## Installation !heading
```
npm install @adobe/cq-spa-page-model-manager
```

## Usage !heading

This module provides the API to manage the model representation of the pages that are composing a SPA.

```
import {PageModelManager} from '@adobe/cq-spa-page-model-manager';

// Initialization
let modelStore = new ModelStore();
let modelClient = new ModelClient(apiHost);

ModelManager.initialize(modelStore, modelClient, "/content/mysite").then((model) => {
    render(model);
});

// Loading of additional content
ModelManager.getData("/content/mysite/myhiddenpage/jcr:content/root/my/component").then(...); 
```

## API !heading

#include "DOCUMENTATION.md"

## Documentation !heading 

The [technical documentation](https://www.adobe.com/go/aem6_4_docs_spa_en) is already available, but if you are unable to solve your problem or you found a bug you can always [contact us](https://www.adobe.com/go/aem6_4_support_en) and ask for help!

## Changelog !heading 

#include "CHANGELOG.md"
