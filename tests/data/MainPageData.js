export const content_test_page_root_child0000_child0010 = {"cqType": "test/components/componentchild0"};
export const content_test_page_root_child0000_child0011 =  {"cqType": "test/components/componentchild1"};

export const content_test_page_root_child0000 = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqItemsOrder": ["child0010", "child0011"],
    "cqItems": {
        "child0010": content_test_page_root_child0000_child0010,
        "child0011":content_test_page_root_child0000_child0011
    },
    "cqType": "wcm/foundation/components/responsivegrid"
};

export const content_test_page_root_child0001 = {"cqType": "test/components/componentchild1"};
export const content_test_page_root = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqItemsOrder": ["child0000", "child0001"],
    "cqItems": {
        "child0000": content_test_page_root_child0000,
        "child0001":content_test_page_root_child0001
    },
    "cqType": "wcm/foundation/components/responsivegrid"
};


export const content_test_child_page_1_root_child1001 =  {"cqType": "test/components/componentchild1"};

export const content_test_child_page_1_root_child1000 = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqType": "wcm/foundation/components/responsivegrid"
};

export const content_test_child_page_1_root = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqItemsOrder": ["child1000", "child1001"],
    "cqItems": {
        "child1000": content_test_child_page_1_root_child1000,
        "child1001": content_test_child_page_1_root_child1001
    },
    "cqType": "wcm/foundation/components/responsivegrid"
};

export const content_test_child_page_1 = {
    "cqType": "we-retail-journal/react/components/structure/page",
    "cqPath": "/content/test/child_page_1",
    "cqItems": {
        "root": content_test_child_page_1_root
    },
    "cqItemsOrder": [
        "root"
    ]
};

export const content_test_subpage2_root_child2000 = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqType": "wcm/foundation/components/responsivegrid"
};

export const content_test_subpage2_root_child2001 = {"cqType": "test/components/componentchild1"};

export const content_test_subpage2_root = {
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    "columnCount": 12,
    "cqItemsOrder": ["child2000", "child2001"],
    "cqItems": {
        "child2000": content_test_subpage2_root_child2000,
        "child2001": content_test_subpage2_root_child2001
    },
    "cqType": "wcm/foundation/components/responsivegrid"
};

export const content_test_subpage2 = {
    "cqType":    "we-retail-journal/react/components/structure/page",
    "cqItems": {
        "root": content_test_subpage2_root
    },
    "cqItemsOrder": [
        "root"
    ]
};

export const content_test_subpage2_root_page =  {"cqType": "test/components/page"};

export const content_test_subpage2_rootPage = {
    "cqType":    "we-retail-journal/react/components/structure/page",
    "cqItems": {
        "page": content_test_subpage2_root_page
    },
    "cqItemsOrder": [
        "page"
    ]
};

export const PAGE_MODEL = {
    "designPath": "/libs/settings/wcm/designs/default",
    "title": "React sample page",
    "lastModifiedDate": 1512116041058,
    "templateName": "sample-template",
    "cssClassNames": "page",
    "language": "en-US",
    "cqItemsOrder": [
        "root"
    ],
    "cqItems": {
        "root": content_test_page_root
    },
    "cqHierarchyType": "page",
    "cqChildren": {
        "/content/test/child_page_1": content_test_child_page_1,
        "/content/test/subpage2/subpage22": content_test_subpage2_rootPage,
        "/content/test/subpage2": content_test_subpage2
    },
    "cqPath": "/content/test/page",
    "cqType": "we-retail-react/components/structure/page"
};

