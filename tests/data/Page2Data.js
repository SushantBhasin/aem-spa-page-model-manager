export const content_test_page2_root_child2001 = {":type": "test/components/componentchild1"};

export const content_test_page2_root_child2000 = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    ":type": "wcm/foundation/components/responsivegrid"
};

export const content_test_page2_root = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    ":itemsOrder": ["child2000", "child2001"],
    ":items": {
        "child2000": content_test_page2_root_child2000,
        "child2001": content_test_page2_root_child2001
    },
    ":type": "wcm/foundation/components/responsivegrid"
};

export const PAGE2 = {
    ":type": "we-retail-journal/react/components/structure/page",
    ":path": "/content/test/page2",
    ":items": {
        "root": content_test_page2_root
    },
    ":itemsOrder": [
        "root"
    ]
};