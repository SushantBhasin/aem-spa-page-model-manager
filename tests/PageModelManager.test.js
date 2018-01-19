import PageModelManager from '../index.js';

describe('PageModelManager', () => {

    const ITEMS_META_DATA = ':items';

    const ITEMS_ORDER_META_DATA = ':itemsOrder';

    const TYPE_META_DATA = ':type';

    const STATIC_PAGE_MODEL = 'react-page.json';

    const ERROR_VALUE = 'error';

    const PAGE_MODEL_JSON = {
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
                    "child0000": {
                        "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
                        "columnCount": 12,
                        ":itemsOrder": ["child0010", "child0011"],
                        ":items": {
                            "child0010": {":type": "test/components/componentchild0"},
                            "child0011": {":type": "test/components/componentchild1"}
                        },
                        ":type": "wcm/foundation/components/responsivegrid"
                    },
                    "child0001": {":type": "test/components/componentchild1"}
                },
                ":type": "wcm/foundation/components/responsivegrid"
            }
        },
        ":type": "we-retail-react/components/structure/page"
    };

    const PARENT_PATH = 'root/child0000';
    const SIBLING_PATH = PARENT_PATH + '/child0010';
    const SIBLING_2_PATH = PARENT_PATH + '/child0011';

    const CHILD_TYPE = 'test/components/componentChildType';
    const CHILD_KEY = 'childXXXX';

    const generateEventData = function ged(cmd) {
        return { detail: { msg: {
            cmd: cmd,
            path: SIBLING_PATH,
            data: {
                key: CHILD_KEY,
                value: {
                    ':type': CHILD_TYPE
                }
            }
        }}};
    };

    const HELPER_dispatchEventInsert = function dei(cmd) {

        const eventData = generateEventData(cmd);

        window.dispatchEvent(new CustomEvent('cq-pagemodel-update', eventData));
    };

    const HELPER_dispatchEventDelete = function ded() {

        const eventData = generateEventData('delete');

        window.dispatchEvent(new CustomEvent('cq-pagemodel-update', eventData));
    };

    const HELPER_dispatchEventMove = function dem(cmd, keyOfTheMovedNode, pathOfTheSibling) {

        const eventData = { detail: { msg: {
            cmd: cmd,
            path: SIBLING_PATH,
            data: {
                key: keyOfTheMovedNode,
                sibling: pathOfTheSibling
            }
        }}};

        window.dispatchEvent(new CustomEvent('cq-pagemodel-update', eventData));
    };


    let server;

    beforeEach(() => {
        server = sinon.fakeServer.create();

        server.respondWith("GET", STATIC_PAGE_MODEL,
            [200, { "Content-Type": "application/json" }, JSON.stringify(PAGE_MODEL_JSON)]);

        PageModelManager.init(STATIC_PAGE_MODEL).then(model => {
            assert.deepEqual(PAGE_MODEL_JSON, model, 'Returns the page model object');
        });

        server.respond();
    });

    afterEach(() => {
        server.restore();
    });

    describe('fetching a page model ->', () => {

        it('should fail when no path has been provided', done => {
            PageModelManager.init().then(() => {
                done(false, 'No page model should be provided');
            }, () => {
                // Should result in an error
                done();
            });
        });

        it('should get an immutable page model', done => {
            PageModelManager.init(STATIC_PAGE_MODEL).then(model1 => {
                model1[TYPE_META_DATA] = ERROR_VALUE;

                PageModelManager.getData().then(model2 => {
                    assert.notEqual(ERROR_VALUE, model2[TYPE_META_DATA], 'The page model is mutable');
                    done();
                });
            });

            server.respond();
        });

    });

    describe('getting a page model ->', () => {

        it('should get an immutable model', done => {
            PageModelManager.getData('root').then(model1 => {
                model1[TYPE_META_DATA] = ERROR_VALUE;

                PageModelManager.getData('root').then(model2 => {

                    assert.notEqual(model1[TYPE_META_DATA], model2[TYPE_META_DATA], 'The model is mutable');
                    done();
                });
            });
        });

        it('should get a specific page model child', done => {
            PageModelManager.getData('root/child0000').then(pageModel => {
                assert.deepEqual(PAGE_MODEL_JSON[ITEMS_META_DATA].root[ITEMS_META_DATA].child0000, pageModel, 'Returns the page model child object');
                done();
            });
        });

    });
    describe('dispatch Event cq-pagemodel-update with message', () => {

        describe('should end with an console if', () => {
            it('no cmd passed', () => {
                let spy = sinon.spy(console, 'error');

                let eventData = { detail: { msg: { }}};
                window.dispatchEvent(new CustomEvent('cq-pagemodel-update', eventData));

                assert(spy.calledOnce);

                // restore the original function
                spy.restore();

            });

            it('event empty', () => {

                let spy = sinon.spy(console, 'warn');

                window.dispatchEvent(new CustomEvent('cq-pagemodel-update', {}));

                assert(spy.calledOnce);

                // restore the original function
                spy.restore();
            });

        });

        describe('"insert" should insert childXXXX', () => {

            it('before child0010', done => {

                PageModelManager.addListener(PARENT_PATH, () => {
                    PageModelManager.getData(PARENT_PATH).then(pageModel => {

                        assert.equal(
                            pageModel[ITEMS_META_DATA][CHILD_KEY][TYPE_META_DATA],
                            CHILD_TYPE);

                        const order = pageModel[ITEMS_ORDER_META_DATA];
                        assert.equal(
                            order.indexOf('childXXXX') + 1,
                            order.indexOf('child0010'));

                        done();
                    });
                });

                HELPER_dispatchEventInsert('insertBefore');

            });

            it('after child0010', done => {
                PageModelManager.addListener(PARENT_PATH, () => {
                    PageModelManager.getData(PARENT_PATH).then(pageModel => {

                        assert.equal(
                            pageModel[ITEMS_META_DATA][CHILD_KEY][TYPE_META_DATA],
                            CHILD_TYPE);

                        const order = pageModel[ITEMS_ORDER_META_DATA];
                        assert.equal(
                            order.indexOf('childXXXX') - 1,
                            order.indexOf('child0010'));

                        done();
                    });
                });

                HELPER_dispatchEventInsert('insertAfter');

            });
        });

        describe('"move" shoud move', () => {
            it('child0010 after child0011', done => {

                PageModelManager.addListener(PARENT_PATH, () => {
                    PageModelManager.getData(PARENT_PATH).then(pageModel => {

                        const order = pageModel[ITEMS_ORDER_META_DATA];
                        assert.equal(
                            order.indexOf('child0010') + 1,
                            order.indexOf('child0011'));

                        done();
                    });
                });

                HELPER_dispatchEventMove('moveAfter', 'child0010', SIBLING_2_PATH);

            });

            it('child0011 before child0010', done => {

                PageModelManager.addListener(PARENT_PATH, () => {
                    PageModelManager.getData(PARENT_PATH).then(pageModel => {

                        const order = pageModel[ITEMS_ORDER_META_DATA];
                        assert.equal(
                            order.indexOf('child0010') + 1,
                            order.indexOf('child0011'));

                        done();
                    });
                });

                HELPER_dispatchEventMove('moveBefore', 'child0011', SIBLING_PATH);

            });
        });

        it('"delete" shoudl delete child0010', done => {
            PageModelManager.addListener(PARENT_PATH, () => {
                PageModelManager.getData(PARENT_PATH).then(pageModel => {

                    assert.equal(
                        pageModel[ITEMS_ORDER_META_DATA].indexOf('child0010'),
                        -1);

                    done();
                });
            });

            HELPER_dispatchEventDelete();

        });

        it('"replace" should replace child0010', done => {

            PageModelManager.addListener(SIBLING_PATH, () => {
                PageModelManager.getData(SIBLING_PATH).then(pageModel => {

                    assert.equal(
                        pageModel[TYPE_META_DATA],
                        CHILD_TYPE);

                    done();
                });
            });

            const eventData = generateEventData('replace');

            window.dispatchEvent(new CustomEvent('cq-pagemodel-update', eventData));

        });
    });


    describe('Listeners ->', () => {
        it('registered listener is notified after a cq-pagemodel-update', done => {
            // note that this is check for only one of the possible cmds
            // all cmds are tested in the cmds section
            PageModelManager.addListener(PARENT_PATH, () => {
                done();
            });

            HELPER_dispatchEventInsert('insertAfter');
        });

    });

});
