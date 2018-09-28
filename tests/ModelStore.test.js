import { ModelStore } from "../src/ModelStore";
import clone from "clone";
import Constants from "../src/Constants";
import {
    PAGE_MODEL,
    content_test_child_page_1,
    content_test_child_page_1_root,
    content_test_child_page_1_root_child1001,
    content_test_child_page_1_root_child1000,
    content_test_page_root_child0001,
    content_test_page_root_child0000,
    content_test_page_root_child0000_child0010,
    content_test_page_root_child0000_child0011,
    content_test_subpage2_rootPage,
    content_test_subpage2_root,
    content_test_subpage2_root_child2001,
    content_test_subpage2
} from "./data/MainPageData";

import { PAGE1, content_test_page1_stem_child0000 } from "./data/Page1Data";
import { content_test_page2_root, content_test_page2_root_child2001 } from "./data/Page2Data";

describe("ModelStore ->", () => {
    let modelStore;
    
    beforeEach(() => {
        modelStore = new ModelStore();
        modelStore.initialize(PAGE_MODEL[Constants.PATH_PROP], clone(PAGE_MODEL));
    });

    const checkNestedScenario = () => {
        let item = modelStore.getData("/content/test/child_page_1/jcr:content/root/child1001");
        assert.deepEqual(item, content_test_child_page_1_root_child1001);
        item = modelStore.getData("/content/test/child_page_1/jcr:content/root/child1000");
        assert.deepEqual(item, content_test_child_page_1_root_child1000);
        item = modelStore.getData("/content/test/child_page_1/jcr:content/root");
        assert.deepEqual(item, content_test_child_page_1_root);
        item = modelStore.getData("/content/test/page/jcr:content/root/child0000/child0010");
        assert.deepEqual(item, content_test_page_root_child0000_child0010);
        item = modelStore.getData("/content/test/page/jcr:content/root/child0000");
        assert.deepEqual(item, content_test_page_root_child0000);
        item = modelStore.getData("/content/test/page/jcr:content/root/child0001");
        assert.deepEqual(item, content_test_page_root_child0001);
    };

    it("initialization", () => {
        assert.deepEqual(modelStore.getData(), PAGE_MODEL);
    });

    describe("getData ->", () => {

        it("should return the full model", () => {
            let item = modelStore.getData();
            assert.deepEqual(item, PAGE_MODEL);
        });

        it("should return the full model", () => {
            let item = modelStore.getData(PAGE_MODEL[Constants.PATH_PROP]);
            assert.deepEqual(item, PAGE_MODEL);
        });

        it("should find a child page", () => {
            let item = modelStore.getData(content_test_child_page_1[Constants.PATH_PROP]);
            assert.deepEqual(item, content_test_child_page_1);
        });

        it("should find nested children", () => {
            checkNestedScenario();
        });

        it("should return the whole structure by default", () => {
            let item = modelStore.getData();
            assert.deepEqual(item, PAGE_MODEL);
        });

        it("should not find wrong path", () => {
            let item = modelStore.getData("/content/test/child_page_1/root/child1001/child_no_loaded");
            assert.isUndefined(item);
            item = modelStore.getData("/content/test/child_page_1/unknown");
            assert.isUndefined(item);
        });

        it("should find element with jcr:content", () => {
            let item = modelStore.getData("/content/test/subpage2/jcr:content/root/child2001");
            assert.deepEqual(item, content_test_subpage2_root_child2001);
            item = modelStore.getData("/content/test/subpage2/jcr:content/root");
            assert.deepEqual(item, content_test_subpage2_root);
        });
    });

    describe("insertData", () => {

        it("should add a page", () => {
            modelStore.insertData("/content/test/page1", PAGE1);
            checkNestedScenario();
            let item = modelStore.getData("/content/test/page1/jcr:content/stem/child0000");
            assert.deepEqual(item, content_test_page1_stem_child0000);
        });

        it("should add an item at the content root after a sibling", () => {
            modelStore.insertData("/content/test/child_page_1/jcr:content/sibling", content_test_page2_root, "root");
            checkNestedScenario();
            let item = modelStore.getData("/content/test/child_page_1");
            assert.equal(item[Constants.ITEMS_ORDER_PROP].length, 2);
            assert.property(item[Constants.ITEMS_PROP], "sibling");
            assert.deepEqual(item[Constants.ITEMS_ORDER_PROP], ["root", "sibling"]);
            assert.deepEqual(item[Constants.ITEMS_PROP].sibling, content_test_page2_root);
            item = modelStore.getData("/content/test/child_page_1/jcr:content/sibling");
            assert.deepEqual(item, content_test_page2_root);
            item = modelStore.getData("/content/test/child_page_1/jcr:content/sibling/child2001");
            assert.deepEqual(item, content_test_page2_root_child2001);
        });

        it("should add an item at the content root before a sibling", () => {
            modelStore.insertData("/content/test/child_page_1/jcr:content/sibling", content_test_page2_root, "root", true);
            checkNestedScenario();
            let item = modelStore.getData("/content/test/child_page_1");
            assert.equal(item[Constants.ITEMS_ORDER_PROP].length, 2);
            assert.property(item[Constants.ITEMS_PROP], "sibling");
            assert.deepEqual(item[Constants.ITEMS_ORDER_PROP], ["sibling", "root"]);
            assert.deepEqual(item[Constants.ITEMS_PROP].sibling, content_test_page2_root);
            item = modelStore.getData("/content/test/child_page_1/jcr:content/sibling");
            assert.deepEqual(item, content_test_page2_root);
            item = modelStore.getData("/content/test/child_page_1/jcr:content/sibling/child2001");
            assert.deepEqual(item, content_test_page2_root_child2001);
        });

        it("should add an item at a nested level after a sibling", () => {
            modelStore.insertData("/content/test/child_page_1/jcr:content/root/sibling", content_test_page2_root, "child1001");
            let item = modelStore.getData("/content/test/child_page_1/jcr:content/root");
            assert.equal(item[Constants.ITEMS_ORDER_PROP].length, 3);
            assert.property(item[Constants.ITEMS_PROP], "sibling");
            assert.deepEqual(item[Constants.ITEMS_ORDER_PROP], ["child1000", "child1001", "sibling"]);
            assert.deepEqual(item[Constants.ITEMS_PROP].sibling, content_test_page2_root);
            item = modelStore.getData("/content/test/child_page_1/jcr:content/root/sibling");
            assert.deepEqual(item, content_test_page2_root);
            item = modelStore.getData("/content/test/child_page_1/jcr:content/root/sibling/child2001");
            assert.deepEqual(item, content_test_page2_root_child2001);
        });

    });

    describe("removeData", () => {

        it("should remove a page", () => {
            assert.property(modelStore.getData()[Constants.CHILDREN_PROP], "/content/test/subpage2");
            modelStore.removeData("/content/test/subpage2");
            assert.notProperty(modelStore.getData()[Constants.CHILDREN_PROP], "/content/test/subpage2");
            let item = modelStore.getData("/content/test/subpage2");
            assert.isUndefined(item);
        });

        it("should remove an item at a nested level", () => {
            let item = modelStore.getData("/content/test/child_page_1/jcr:content/root");
            assert.deepEqual(item, content_test_child_page_1_root);
            assert.property(item[Constants.ITEMS_PROP], "child1001");
            modelStore.removeData("/content/test/child_page_1/jcr:content/root/child1001");
            item = modelStore.getData("/content/test/child_page_1/jcr:content/root");
            assert.notProperty(item[Constants.ITEMS_PROP], "child1001");
            item = modelStore.getData("/content/test/child_page_1/jcr:content/root/child1001");
            assert.isUndefined(item);
        });

        it("should remove an item under the jcr:content", () => {
            let item = modelStore.getData("/content/test/subpage2/jcr:content/root");
            assert.deepEqual(item, content_test_subpage2_root);
            assert.property(item[Constants.ITEMS_PROP], "child2000");
            modelStore.removeData("/content/test/subpage2/jcr:content/root/child2000");
            item = modelStore.getData("/content/test/subpage2/jcr:content/root");
            assert.notProperty(item[Constants.ITEMS_PROP], "child2000");
            item = modelStore.getData("/content/test/subpage2/jcr:content/root/child2000");
            assert.isUndefined(item);
        });
    });

    describe("immutability", () => {

        it("should not alter the data stored in the model", () => {
            let item = modelStore.getData("/content/test/subpage2/jcr:content/root");
            item.mutation = true;
            let item2 = modelStore.getData("/content/test/subpage2/jcr:content/root");
            assert.isUndefined(item2.mutation);
        });

        it("should alter the data stored in the model", () => {
            let item = modelStore.getData("/content/test/subpage2/jcr:content/root", false);
            item.mutation = true;
            let item2 = modelStore.getData("/content/test/subpage2/jcr:content/root");
            assert.isTrue(item2.mutation);
        });
    });
});