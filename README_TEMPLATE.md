## Installation !heading
```
npm install @adobe/cq-spa-page-model-manager
```

## Usage !heading

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

## API !heading

#include "DOCUMENTATION.md"

## Documentation !heading 

The [technical documentation](https://www.adobe.com/go/aem6_4_docs_spa_en) is already available, but if you are unable to solve your problem or you found a bug you can always [contact us](https://www.adobe.com/go/aem6_4_support_en) and ask for help!

## Changelog !heading 

#include "CHANGELOG.md"
