export const content_test_groot_child1000 = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqType": "wcm/foundation/components/responsivegrid"
};

export const content_test_groot_child1001 = {"cqType": "test/components/componentchild1"}

export const content_test_groot = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqItemsOrder": ["child1000", "child1001"],
    "cqItems": {
        "child1000": content_test_groot_child1000,
        "child1001": content_test_groot_child1001
    },
    "cqType": "wcm/foundation/components/responsivegrid"
};


export const PAGE3 = {
    "cqType": "we-retail-journal/react/components/structure/page",
    "cqPath": "/content/test", 
    "cqItems": {
        "groot": content_test_groot
    },
    "cqItemsOrder": [
        "groot"
    ]
};
