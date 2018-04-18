## Installation !heading
```
npm install @adobe/cq-spa-page-model-manager@beta
```

## Usage !heading

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

## API !heading

#include "DOCUMENTATION.md"

## Documentation !heading 

The [technical documentation](https://www.adobe.com/go/aem6_4_docs_spa_en) is already available, but if you are unable to solve your problem or you found a bug you can always [contact us](https://www.adobe.com/go/aem6_4_support_en) and ask for help!

## Changelog !heading 

#include "CHANGELOG.md"
