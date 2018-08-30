export const content_test_page2_root_child2001 = {"cqType": "test/components/componentchild1"};

export const content_test_page2_root_child2000 = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqType": "wcm/foundation/components/responsivegrid"
};

export const content_test_page2_root = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqItemsOrder": ["child2000", "child2001"],
    "cqItems": {
        "child2000": content_test_page2_root_child2000,
        "child2001": content_test_page2_root_child2001
    },
    "cqType": "wcm/foundation/components/responsivegrid"
};

export const PAGE2 = {
    "cqType": "we-retail-journal/react/components/structure/page",
    "cqPath": "/content/test/page2",
    "cqItems": {
        "root": content_test_page2_root
    },
    "cqItemsOrder": [
        "root"
    ]
};
