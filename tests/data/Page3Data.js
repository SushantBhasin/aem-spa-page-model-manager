export const content_test_groot_child1000 = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    ":type": "wcm/foundation/components/responsivegrid"
};

export const content_test_groot_child1001 = {":type": "test/components/componentchild1"}

export const content_test_groot = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    ":itemsOrder": ["child1000", "child1001"],
    ":items": {
        "child1000": content_test_groot_child1000,
        "child1001": content_test_groot_child1001
    },
    ":type": "wcm/foundation/components/responsivegrid"
};


export const PAGE3 = {
    ":type": "we-retail-journal/react/components/structure/page",
    ":path": "/content/test", 
    ":items": {
        "groot": content_test_groot
    },
    ":itemsOrder": [
        "groot"
    ]
};