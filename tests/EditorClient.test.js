import fetchMock from "fetch-mock";
import clone from 'clone';
import ModelManager from '../src/ModelManager';
import InternalConstants from '../src/InternalConstants';
import { ModelStore } from '../src/ModelStore';
import Constants from '../src/Constants';

describe("EditorClient ->", () => {

    const DEFAULT_PAGE_MODEL_PATH = window.location.pathname.replace(/\.htm(l)?$/,'');
    const DEFAULT_PAGE_MODEL_URL = DEFAULT_PAGE_MODEL_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
    const CHILD0000_PATH = DEFAULT_PAGE_MODEL_PATH + '/jcr:content/root/child0000';
    const CHILD0010_PATH = CHILD0000_PATH + '/child0010';
    const CHILD0011_PATH = CHILD0000_PATH + '/child0011';
    const CHILDXXXX_TYPE = 'test/components/componentChildType';
    const CHILDXXXX_KEY = 'childXXXX';

    const CHILD0000_MODEL_JSON = {
        "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
            "columnCount": 12,
            ":itemsOrder": ["child0010", "child0011"],
            ":items": {
            "child0010": {":type": "test/components/componentchild0"},
            "child0011": {":type": "test/components/componentchild1"}
        },
        ":type": "wcm/foundation/components/responsivegrid"
    };

    const PAGE_MODEL_JSON = {
        ":path": DEFAULT_PAGE_MODEL_PATH,
        "designPath": "/libs/settings/wcm/designs/default",
        "title": "React sample page",
        "lastModifiedDate": 1512116041058,
        "templateName": "sample-template",
        "cssClassNames": "page",
        "language": "en-US",
        ":itemsOrder": [
            "root"
        ],
        ":items": {
            "root": {
                "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
                "columnCount": 12,
                ":itemsOrder": ["child0000", "child0001"],
                ":items": {
                    "child0000": CHILD0000_MODEL_JSON,
                    "child0001": {":type": "test/components/componentchild1"}
                },
                ":type": "wcm/foundation/components/responsivegrid"
            }
        },
        ":hierarchyType": "page",
        ":children": {
            "/content/test/child_page_1": {
                ":type":	"we-retail-journal/react/components/structure/page",
                ":items": {
                    "root": {
                        "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
                        "columnCount": 12,
                        ":itemsOrder": ["child1000", "child1001"],
                        ":items": {
                            "child1000": {
                                "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
                                "columnCount": 12,
                                ":type": "wcm/foundation/components/responsivegrid"
                            },
                            "child1001": {":type": "test/components/componentchild1"}
                        },
                        ":type": "wcm/foundation/components/responsivegrid"
                    }
                },
                ":itemsOrder": [
                    "root"
                ]
            },
            "/content/test/subpage2": {
                ":type":	"we-retail-journal/react/components/structure/page",
                ":items": {
                    "root": {
                        "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
                        "columnCount": 12,
                        ":itemsOrder": ["child2000", "child2001"],
                        ":items": {
                            "child2000": {
                                "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
                                "columnCount": 12,
                                ":type": "wcm/foundation/components/responsivegrid"
                            },
                            "child2001": {":type": "test/components/componentchild1"}
                        },
                        ":type": "wcm/foundation/components/responsivegrid"
                    }
                },
                ":itemsOrder": [
                    "root"
                ]
            },
        },
        ":type": "we-retail-react/components/structure/page"
    };


    let getJSONResponse = (body) => {
        return new window.Response(JSON.stringify(body), {
            status: 200,
            headers: {
                "Content-type": "application/json"
            }
        });
    };

    const dispatchEvent_PageModelUpdate = function (cmd, path, data) {
        window.dispatchEvent(new CustomEvent('cq-pagemodel-update', {
            detail: {
                msg: {
                    cmd: cmd,
                    path: path,
                    data: data
                }
            }
        }));
    };

    describe('"cq-pagemodel-update" event ->', () => {

        let consoleErrorSpy;

        beforeEach(() => {
            ModelManager.initialize({path: DEFAULT_PAGE_MODEL_URL, model: clone(PAGE_MODEL_JSON)});
            consoleErrorSpy = sinon.spy(console, 'error');
        });

        afterEach(() => {
            consoleErrorSpy.restore();
        });

        it('should log an error if no msg is passed', () => {
            let eventData = {detail: {msg: {}}};

            assert(!consoleErrorSpy.called);

            window.dispatchEvent(new CustomEvent('cq-pagemodel-update', eventData));

            assert(consoleErrorSpy.called);
        });

        it('should log a warning when the event data is empty', () => {
            assert(!consoleErrorSpy.called);

            window.dispatchEvent(new CustomEvent('cq-pagemodel-update', {}));

            assert(consoleErrorSpy.called);
        });

        it('should delete child0010 when triggered with the "delete" cmd', done => {
            ModelManager.addListener(CHILD0000_PATH, () => {
                ModelManager.getData(CHILD0000_PATH).then(pageModel => {
                    assert.equal(
                        pageModel[Constants.ITEMS_ORDER_PROP].indexOf('child0010'),
                        -1);

                    done();
                });
            });

            dispatchEvent_PageModelUpdate('delete', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });
        });

        it('should replace child0010 when triggered with the "replace" cmd', done => {
            ModelManager.addListener(CHILD0010_PATH, () => {
                ModelManager.getData(CHILD0010_PATH).then(pageModel => {
                    assert.equal(
                        pageModel[Constants.TYPE_PROP],
                        CHILDXXXX_TYPE);

                    done();
                });
            });

            dispatchEvent_PageModelUpdate('replace', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });
        });

        describe('when triggered with the "insert" cmd', () => {

            it('should insert before child0010', done => {
                ModelManager.addListener(CHILD0000_PATH, () => {
                    ModelManager.getData(CHILD0000_PATH).then(pageModel => {
                        assert.equal(
                            pageModel[Constants.ITEMS_PROP][CHILDXXXX_KEY][Constants.TYPE_PROP],
                            CHILDXXXX_TYPE);

                        const order = pageModel[Constants.ITEMS_ORDER_PROP];
                        assert.equal(
                            order.indexOf('childXXXX') + 1,
                            order.indexOf('child0011'));

                        done();
                    });
                });

                dispatchEvent_PageModelUpdate('insertBefore', CHILD0011_PATH, {
                    key: CHILDXXXX_KEY,
                    value: {
                        ':type': CHILDXXXX_TYPE
                    }
                });
            });

            it('should insert after child0010', done => {
                ModelManager.addListener(CHILD0000_PATH, () => {
                    ModelManager.getData(CHILD0000_PATH).then(pageModel => {
                            assert.equal(
                                pageModel[Constants.ITEMS_PROP][CHILDXXXX_KEY][Constants.TYPE_PROP],
                                CHILDXXXX_TYPE);

                            const order = pageModel[Constants.ITEMS_ORDER_PROP];
                            assert.equal(
                                order.indexOf('childXXXX') - 1,
                                order.indexOf('child0011'));

                            done();
                        });
                    }
                );

                dispatchEvent_PageModelUpdate('insertAfter', CHILD0011_PATH, {
                    key: CHILDXXXX_KEY,
                    value: {
                        ':type': CHILDXXXX_TYPE
                    }
                });
            });
        });

    });

    describe('listeners ->', () => {

        beforeEach(() => {
            ModelManager.initialize({path: DEFAULT_PAGE_MODEL_URL, model: clone(PAGE_MODEL_JSON)});

            fetchMock.mock('end:' + CHILD0000_PATH + '.model.json', getJSONResponse(CHILD0000_MODEL_JSON));
        });

        afterEach(() => {
            fetchMock.restore();
        });

        it('should be notified when updating the model', done => {
            ModelManager.addListener(CHILD0000_PATH, done);

            dispatchEvent_PageModelUpdate('insertAfter', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });
        });

        it('should be notified when reloading the model', done => {
            ModelManager.addListener(CHILD0000_PATH, done);

            ModelManager.getData({
                path: CHILD0000_PATH,
                forceReload: true
            });
        });

        it('should remove a listener', () => {
            let spy = sinon.spy();

            ModelManager.addListener(CHILD0000_PATH, spy);
            ModelManager.removeListener(CHILD0000_PATH, spy);

            dispatchEvent_PageModelUpdate('insertAfter', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });

            expect(spy).not.to.be.called;
        });
    });

});