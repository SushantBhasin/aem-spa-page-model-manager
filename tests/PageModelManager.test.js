import {PageModelManager, Constants} from '../index';
import InternalConstants from '../src/InternalConstants';
import MetaProperty from "../src/MetaProperty";

describe('PageModelManager ->', () => {

    const DEFAULT_PAGE_MODEL_PATH = window.location.pathname.replace(/\.htm(l)?$/,'');
    const CUSTOM_PAGE_MODEL_PATH = 'custom-path';
    const DEFAULT_PAGE_MODEL_URL = DEFAULT_PAGE_MODEL_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
    const CUSTOM_PAGE_MODEL_URL = CUSTOM_PAGE_MODEL_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
    const ROOT_RESOURCE_URL = 'page/root' + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
    const CHILD_PAGE_1_PATH = '/content/test/child_page_1';
    const CHILD_PAGE_1_URL = CHILD_PAGE_1_PATH + '.model.json';

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

    const CUSTOM_PAGE_MODEL_JSON = {
        "designPath": "/libs/settings/wcm/designs/default",
        "title": "React sample page Custom",
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
                ":itemsOrder": ["child0000"],
                ":items": {
                    "child0000": {":type": "test/components/componentchild1"}
                },
                ":type": "wcm/foundation/components/responsivegrid"
            }
        },
        ":type": "we-retail-react/components/structure/page"
    };

    const CHILD_PAGE_1 = {
        ":type":	"we-retail-journal/react/components/structure/page",
        ":items": {
            "root": {
                "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
                "columnCount": 12,
                ":itemsOrder": ["child1000", "child1001", "child1002"],
                ":items": {
                    "child1000": {
                        "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
                        "columnCount": 12,
                        ":type": "wcm/foundation/components/responsivegrid"
                    },
                    "child1001": {":type": "test/components/componentchild1"},
                    "child1002": {":type": "test/components/componentchild2"}
                },
                ":type": "wcm/foundation/components/responsivegrid"
            }
        },
        ":itemsOrder": [
            "root"
        ]
    };

    const CHILD0000_PATH = 'root/child0000';
    const CHILD0010_PATH = CHILD0000_PATH + '/child0010';

    const CHILDXXXX_TYPE = 'test/components/componentChildType';
    const CHILDXXXX_KEY = 'childXXXX';


    const dispatchEvent_PageModelUpdate = function (cmd, path, data) {
        window.dispatchEvent(new CustomEvent('cq-pagemodel-update', {
            detail: {
                msg: {
                    cmd: cmd,
                    dataPath: path,
                    data: data
            }
            }
        }));
    };

    let server;

    function setPageModelUrlMetaProperty(content) {
        let pageModelUrlMetaProperty = document.head.querySelector('meta[property="' + MetaProperty.PAGE_MODEL_ROOT_URL + '"]');

        if (!pageModelUrlMetaProperty) {
            pageModelUrlMetaProperty = document.createElement('meta');
        }
        pageModelUrlMetaProperty.setAttribute('property', MetaProperty.PAGE_MODEL_ROOT_URL);

        pageModelUrlMetaProperty.content = content;
        document.head.appendChild(pageModelUrlMetaProperty);
    }

    function removePageModelUrlMetaProperty() {
        let dataTypeHintElement = document.querySelector('meta[property="' + MetaProperty.PAGE_MODEL_ROOT_URL + '"]');

        if (dataTypeHintElement) {
            document.head.removeChild(dataTypeHintElement);
        }
    }

    beforeEach(() => {
        server = sinon.fakeServer.create();

        server.respondWith("GET", DEFAULT_PAGE_MODEL_URL,
            [200, { "Content-Type": "application/json" }, JSON.stringify(PAGE_MODEL_JSON)]);

        server.respondWith("GET", CUSTOM_PAGE_MODEL_URL,
            [200, { "Content-Type": "application/json" }, JSON.stringify(CUSTOM_PAGE_MODEL_JSON)]);

        server.respondWith("GET", CHILD_PAGE_1_URL,
            [200, { "Content-Type": "application/json" }, JSON.stringify(CHILD_PAGE_1)]);

        server.respondImmediately = true;

        window.location.hash = '';
        // should return the page model for the default path
        return PageModelManager.init().then(model => {
            assert.deepEqual(PAGE_MODEL_JSON, model, 'Returns the page model object');
        });
    });

    afterEach(() => {
        server.restore();
    });

    describe('URL rewriting ->', () => {

        const EXPECTED_URL = {
            "http://content/url/page": 'http://content/url/page.model.json',
            "http://content/url/page.html/suffix": 'http://content/url/page.model.json/suffix',
            "http://content/url/page.html?query=param": 'http://content/url/page.model.json?query=param',
            "http://contextpath/content/url/page.html": 'http://contextpath/content/url/page.model.json',
            "/content/url/page": '/content/url/page.model.json',
            "/content/url/page.htm": '/content/url/page.model.json',
            "/content/url/page.html": '/content/url/page.model.json',
            "/content/url/page.json": '/content/url/page.model.json',
            "/content/url/page.model.json": '/content/url/page.model.json',
            "/content/url/page.selector.1.json": '/content/url/page.model.selector.1.json',
            "/content/url/page.model.selector.json": '/content/url/page.model.selector.json',
            "/content/url/page.model.selector.1.json": '/content/url/page.model.selector.1.json',
            "/content/url/page.model.selector.1.json/suffix/1?query=param":  '/content/url/page.model.selector.1.json/suffix/1?query=param',
            "/content/url/page.model.selector.1.json?query=param": '/content/url/page.model.selector.1.json?query=param'
        };

        beforeEach(() => {
            server = sinon.fakeServer.create();
            server.respondImmediately = true;

            server.respondWith("GET", DEFAULT_PAGE_MODEL_PATH + ".model.json",
                [200, { "Content-Type": "application/json" }, JSON.stringify({})]);

            for (let key in EXPECTED_URL) {
                if (EXPECTED_URL.hasOwnProperty(key)) {
                    server.respondWith("GET", EXPECTED_URL[key],
                        [200, { "Content-Type": "application/json" }, JSON.stringify({key: key})]);
                }
            }

            return PageModelManager.init({pagePath: '/content/url/page'});
        });

        it('should rewrite the given URLs and call the expected URLs', () => {
            // include the initialization call
            const chainPromises = [];

            for (let key in EXPECTED_URL) {
                if (EXPECTED_URL.hasOwnProperty(key)) {
                    PageModelManager.init({pagePath: key}).then((model) => {
                        if (chainPromises.length) {
                            chainPromises[chainPromises.length - 1].then(() => {
                                const promise = new Promise((resolve, reject) => {
                                    key === model.key ? resolve() : reject();
                                });

                                chainPromises.push(promise);
                            });
                        }
                    });
                }
            }

            return Promise.all(chainPromises);
        });
    });

    describe('init ->', () => {

        beforeEach(() => {
            // should return the page model for the default path
            return PageModelManager.init().then(model => {
                assert.deepEqual(PAGE_MODEL_JSON, model, 'Returns the page model object');
            });
        });

        afterEach(() => {
            removePageModelUrlMetaProperty();
        });

        describe('getModelPath ->', () => {

            it('should return the default model path as the model path the PageModelManager has been initialized with', () => {
                assert.equal(DEFAULT_PAGE_MODEL_URL, PageModelManager.getRootModelUrl());
            });

            it('should return the custom model path as the model path the PageModelManager has been initialized with using a parameter', () => {
                return PageModelManager.init(CUSTOM_PAGE_MODEL_PATH).then((model) => {
                    assert.deepEqual(CUSTOM_PAGE_MODEL_JSON, model, 'Wrong page model object');
                    assert.equal(CUSTOM_PAGE_MODEL_URL, PageModelManager.getRootModelUrl());
                });
            });

            it('should return the custom model path as the model path the PageModelManager has been initialized with using the meta property', () => {
                setPageModelUrlMetaProperty(CUSTOM_PAGE_MODEL_URL);

                return PageModelManager.init().then((model) => {
                    /**
                     * 1. the meta property points to the custom path
                     * 2. the page model path is not provided as a parameter
                     * 3. the URL content path differs from the meta property
                     *
                     * Expected result:
                     *
                     * The page model is initialized with a different path than the one exposed by the current URL.
                     * The model path contained in the current URL is added as a child of the root page model
                     */

                    let compositeModel = Object.assign({}, CUSTOM_PAGE_MODEL_JSON);
                    compositeModel[Constants.CHILDREN_PROP] = compositeModel[Constants.CHILDREN_PROP] || {};
                    compositeModel[Constants.CHILDREN_PROP][DEFAULT_PAGE_MODEL_PATH] = PAGE_MODEL_JSON;

                    assert.deepEqual(compositeModel, model, 'Wrong page model object');
                    assert.equal(CUSTOM_PAGE_MODEL_URL, PageModelManager.getRootModelUrl());
                });
            });
        });

        describe('immutable page model', () => {

            it('should return an immutable model when called with no parameter', () => {
                return PageModelManager.init().then(model1 => {
                    model1[Constants.TYPE_PROP] = ERROR_VALUE;

                    return PageModelManager.getData().then(model2 => {
                        assert.notEqual(ERROR_VALUE, model2[Constants.TYPE_PROP], 'The page model is mutable');
                    });
                });
            });

            it('should return an immutable model when called with undefined as parameter', () => {
                return PageModelManager.init().then(model1 => {
                    model1[Constants.TYPE_PROP] = ERROR_VALUE;

                    return PageModelManager.getData(undefined).then(model2 => {
                        assert.notEqual(ERROR_VALUE, model2[Constants.TYPE_PROP], 'The page model is mutable');
                    });
                });
            });

            it('should return an immutable model when called with null as parameter', () => {
                return PageModelManager.init().then(model1 => {
                    model1[Constants.TYPE_PROP] = ERROR_VALUE;

                    return PageModelManager.getData(undefined).then(model2 => {
                        assert.notEqual(ERROR_VALUE, model2[Constants.TYPE_PROP], 'The page model is mutable');
                    });
                });
            });

            it('should return an immutable model when called with false as parameter', () => {
                return PageModelManager.init().then(model1 => {
                    model1[Constants.TYPE_PROP] = ERROR_VALUE;

                    return PageModelManager.getData(false).then(model2 => {
                        assert.notEqual(ERROR_VALUE, model2[Constants.TYPE_PROP], 'The page model is mutable');
                    });
                });
            });

            it('should return an immutable model when called with "" as parameter', () => {
                return PageModelManager.init().then(model1 => {
                    model1[Constants.TYPE_PROP] = ERROR_VALUE;

                    return PageModelManager.getData('').then(model2 => {
                        assert.notEqual(ERROR_VALUE, model2[Constants.TYPE_PROP], 'The page model is mutable');
                    });
                });
            });

            it('should return an immutable model when called with a config and a pagePath parameter', () => {
                return PageModelManager.init({pagePath: DEFAULT_PAGE_MODEL_URL}).then(model1 => {
                    model1[Constants.TYPE_PROP] = ERROR_VALUE;

                    return PageModelManager.getData('').then(model2 => {
                        assert.notEqual(ERROR_VALUE, model2[Constants.TYPE_PROP], 'The page model is mutable');
                    });
                });
            });

            it('should initialize the model and return an imutable object', () => {
                return PageModelManager.init({immutable: false}).then(model1 => {
                    model1[Constants.TYPE_PROP] = ERROR_VALUE;

                    return PageModelManager.getData('').then(model2 => {
                        assert.equal(ERROR_VALUE, model2[Constants.TYPE_PROP], 'The page model is mutable');
                    });
                });
            });

            it('should initialize the model and return a mutable object', () => {
                return PageModelManager.init({immutable: false}).then(model1 => {
                    model1[Constants.TYPE_PROP] = ERROR_VALUE;

                    return PageModelManager.getData('').then(model2 => {
                        assert.equal(ERROR_VALUE, model2[Constants.TYPE_PROP], 'The page model is immutable');
                    });
                });
            });
        });

        it('should get the default page model', done => {
            PageModelManager.getData().then(model => {
                assert.deepEqual(PAGE_MODEL_JSON, model, 'Unexpected page model');
                done();
            }, () => {
                done(false, 'promise rejected');
            });
        });

        it('should get the default root model', done => {
            PageModelManager.getData('root').then(model => {
                assert.deepEqual(PAGE_MODEL_JSON[Constants.ITEMS_PROP]['root'], model, 'Unexpected root model');
                done();
            }, () => {
                done(false, 'promise rejected');
            });
        });

        it('should get the page model by default', done => {
            PageModelManager.init().then(model => {
                assert.deepEqual(PAGE_MODEL_JSON, model, 'Unexpected root model');
                done();
            }, () => {
                done(false, 'promise rejected');
            });
        });

        it('should return a custom model for the given path', () => {
            return PageModelManager.init(CUSTOM_PAGE_MODEL_PATH).then(model => {
                assert.deepEqual(CUSTOM_PAGE_MODEL_JSON, model, 'Unexpected page model returned');
            });
        });

        it('should fire "cq-pagemodel-loaded" only once with the root page model', (done) => {
            window.addEventListener('cq-pagemodel-loaded', function (event) {
                if (event.detail.model === PAGE_MODEL_JSON) {
                    done();
                } else {
                    done(false);
                }

            });

            PageModelManager.init();
        });

        it('should reject the promise when trying to init with page model that cannot be loaded', (done) => {
            PageModelManager.init("/nonexisting")
                .catch(() => {
                    done();
            });
        });
    });

    describe('getData ->', () => {

        beforeEach(() => {
            return PageModelManager.init();
        });

        it('should get an immutable model by default', () => {
            return PageModelManager.getData('root').then(model1 => {
                model1[Constants.TYPE_PROP] = ERROR_VALUE;
                return PageModelManager.getData('root').then(model2 => {
                    assert.notEqual(model1[Constants.TYPE_PROP], model2[Constants.TYPE_PROP], 'The model is mutable');
                });
            });
        });
        it('should get an entire model when passing the data path as an empty string', () => {
            return PageModelManager.getData('').then(model => {
                assert.deepEqual(PAGE_MODEL_JSON, model, 'Returns the entire model object');
            });
        });
        it('should get a child model from the root page when passing the data path as a string', () => {
            return PageModelManager.getData(CHILD0000_PATH).then(childModel => {
                assert.deepEqual(PAGE_MODEL_JSON[Constants.ITEMS_PROP].root[Constants.ITEMS_PROP].child0000, childModel, 'Returns child model object');
            });
        });
        it('should get a child model from the root page when passing the data path in the config parameter', () => {
            return PageModelManager.getData({
                dataPath: CHILD0000_PATH
            }).then(childModel => {
                assert.deepEqual(PAGE_MODEL_JSON[Constants.ITEMS_PROP].root[Constants.ITEMS_PROP].child0000, childModel, 'Returns the child model object');
            });
        });
        it('should get a child model from the root page when passing the root page and the data path in the config parameter', () => {
            return PageModelManager.getData({
                pagePath: DEFAULT_PAGE_MODEL_PATH,
                dataPath: CHILD0000_PATH
            }).then(childModel => {
                assert.deepEqual(PAGE_MODEL_JSON[Constants.ITEMS_PROP].root[Constants.ITEMS_PROP].child0000, childModel, 'Returns the child model object');
            });
        });
        it('should get a reloaded child model when passing the forceReload parameter', () => {
            // Clone (by value) and add a new property
            let PAGE_MODIFIED_JSON_MODIFIED = JSON.parse(JSON.stringify(PAGE_MODEL_JSON));
            PAGE_MODIFIED_JSON_MODIFIED[Constants.ITEMS_PROP]["root"][Constants.ITEMS_PROP]["child0000"].newProperty = "test!";

            // Make server return the modified JSON
            server.respondWith("GET", DEFAULT_PAGE_MODEL_URL,
                [200, {"Content-Type": "application/json"}, JSON.stringify(PAGE_MODIFIED_JSON_MODIFIED)]);

            return PageModelManager.getData({
                dataPath: CHILD0000_PATH,
                forceReload: true
            }).then(childModel => {
                assert.deepEqual(PAGE_MODIFIED_JSON_MODIFIED[Constants.ITEMS_PROP].root[Constants.ITEMS_PROP].child0000, childModel, 'Returns the refreshed child model object');

                // Make server return the initial JSON
                server.respondWith("GET", DEFAULT_PAGE_MODEL_URL,
                    [200, {"Content-Type": "application/json"}, JSON.stringify(PAGE_MODEL_JSON)]);
            });
        });
        it('should get a reloaded child model and inform listener when passing the forceReload parameter', (done) => {
            // to cover the force reload feature
            let data = 'child1001';
            let dataPath = 'root/' + data;

            let listenerCalled = new Promise((resolve) => {
                PageModelManager.addListener({
                    dataPath: dataPath,
                    pagePath: CHILD_PAGE_1_PATH,
                    callback: resolve
                });
            });

            server.resetHistory();

            let dataFetched = new Promise((resolve) => {
                PageModelManager.getData({
                    dataPath: dataPath,
                    forceReload: true,
                    pagePath: CHILD_PAGE_1_PATH
                }).then(childModel => {
                    assert.deepEqual(CHILD_PAGE_1[Constants.ITEMS_PROP].root[Constants.ITEMS_PROP][data], childModel, 'Returns the child model object from a different page');
                    assert.equal(1, server.requestCount, 'force reload should call the server');
                    assert.equal(CHILD_PAGE_1_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION, server.lastRequest.url);
                    resolve();
                });
            });

            Promise.all([listenerCalled, dataFetched]).then(() => {
                done();
            });

        });
        it('should get a new child model from the root page', () => {
            // Set up server behavior (simulates that a new child has been added to the model)
            let PAGE_MODEL_JSON_MODIFIED = JSON.parse(JSON.stringify(PAGE_MODEL_JSON));
            PAGE_MODEL_JSON_MODIFIED[Constants.ITEMS_PROP].root[Constants.ITEMS_PROP].newchild = {
                ":type": "test/components/newchild"
            };

            server.respondWith("GET", DEFAULT_PAGE_MODEL_URL,
                [200, { "Content-Type": "application/json" }, JSON.stringify(PAGE_MODEL_JSON_MODIFIED)]);

            return PageModelManager.getData({
                pagePath: DEFAULT_PAGE_MODEL_PATH,
                dataPath: 'root/newchild'
            }).then(childModel => {
                assert.deepEqual(PAGE_MODEL_JSON_MODIFIED[Constants.ITEMS_PROP].root[Constants.ITEMS_PROP].newchild, childModel, 'Returns the new child model object');

                // Clean-up server behavior
                server.respondWith("GET", DEFAULT_PAGE_MODEL_URL,
                    [200, { "Content-Type": "application/json" }, JSON.stringify(PAGE_MODEL_JSON)]);
            });
        });
        it('should get a page model that has not been loaded yet', () => {
            return PageModelManager.getData({
                pagePath: CUSTOM_PAGE_MODEL_PATH
            }).then(pageModel => {
                assert.deepEqual(CUSTOM_PAGE_MODEL_JSON, pageModel, 'Returns the page model object');
            });
        });
        it('should inform root listener when page model updated with a new subpage', (done) => {
            PageModelManager.addListener({
                dataPath: '',
                callback: done
            });

            PageModelManager.getData({
                pagePath: CUSTOM_PAGE_MODEL_PATH
            });
        });
        it('should get page model data from cache correctly', (done) => {
            let data = 'child1001';

            // corresponds to the call to init()
            assert(1, server.requestCount);

            PageModelManager.getData({
                pagePath: CHILD_PAGE_1_PATH,
                dataPath: 'root/' + data
            }).then(childModel => {
                assert.deepEqual(PAGE_MODEL_JSON[Constants.CHILDREN_PROP][CHILD_PAGE_1_PATH][Constants.ITEMS_PROP].root[Constants.ITEMS_PROP][data], childModel, 'Returns the child model object from a different page');
                assert(1, server.requestCount, 'No extra server request should be performed.');
                done();
            });
        });
        it('when data missing in cache should re-fetch data from server, return page model and inform listener', (done) => {
            let data = 'child1002';
            let dataPath = 'root/' + data;

            let listenerCalled = new Promise((resolve) => {
                PageModelManager.addListener({
                    dataPath: dataPath,
                    callback: resolve
                });
            });

            let dataFetched = new Promise((resolve) => {
                PageModelManager.getData({
                pagePath: CHILD_PAGE_1_PATH,
                dataPath: dataPath
            }).then(childModel => {
                    assert.deepEqual(CHILD_PAGE_1[Constants.ITEMS_PROP].root[Constants.ITEMS_PROP][data], childModel, 'Returns the child model object from a different page');
                    assert.equal(server.lastRequest.url, CHILD_PAGE_1_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION);
                    resolve();
                });
            });

            Promise.all([listenerCalled, dataFetched]).then(() => {
                done();
            });
        });
        it('should get a child model from a page that has not been loaded yet', () => {
            return PageModelManager.getData({
                pagePath: CUSTOM_PAGE_MODEL_PATH,
                dataPath: CHILD0000_PATH
            }).then(childModel => {
                assert.deepEqual(CUSTOM_PAGE_MODEL_JSON[Constants.ITEMS_PROP].root[Constants.ITEMS_PROP].child0000, childModel, 'Returns the child model object from a different page');
            });
        });

        describe('it should reject the promise', () => {

            beforeEach(() => {
                return PageModelManager.init();
            });

            it('when trying to get a page model that cannot be loaded - no page path', (done) => {
                PageModelManager.getData({
                    pagePath: "/nonexisting",
                    dataPath: "root/nonexistingchild"
                }).catch(function () {
                    done();
                });
            });

            it('when trying to get a child model that cannot be loaded - no data', (done) => {
                PageModelManager.getData({
                    pagePath: DEFAULT_PAGE_MODEL_PATH,
                    dataPath: "nonexistingchild"
                }).catch(function () {
                    done();
                });
            });
        });
    });

    describe('"cq-pagemodel-update" event ->', () => {

        it('should log an error if no msg is passed', () => {
            let spy = sinon.spy(console, 'error');
            let eventData = {detail: {msg: {}}};
            window.dispatchEvent(new CustomEvent('cq-pagemodel-update', eventData));

            assert(spy.calledOnce);

            // restore the original function
            spy.restore();

        });

        it('should log a warning when the event data is empty', () => {
            let spy = sinon.spy(console, 'warn');
            window.dispatchEvent(new CustomEvent('cq-pagemodel-update', {}));

            assert(spy.calledOnce);

            // restore the original function
            spy.restore();
        });

        describe('when triggered with the "insert" cmd', () => {

            it('should insert before child0010', done => {
                PageModelManager.addListener({
                    dataPath: CHILD0000_PATH,
                    callback: () => {
                        PageModelManager.getData(CHILD0000_PATH).then(pageModel => {
                            assert.equal(
                                pageModel[Constants.ITEMS_PROP][CHILDXXXX_KEY][Constants.TYPE_PROP],
                                CHILDXXXX_TYPE);

                            const order = pageModel[Constants.ITEMS_ORDER_PROP];
                            assert.equal(
                                order.indexOf('childXXXX') + 1,
                                order.indexOf('child0010'));

                            done();
                        });
                    }
                });

                dispatchEvent_PageModelUpdate('insertBefore', CHILD0010_PATH, {
                    key: CHILDXXXX_KEY,
                    value: {
                        ':type': CHILDXXXX_TYPE
                    }
                });
            });

            it('should insert after child0010', done => {
                PageModelManager.addListener({
                    dataPath: CHILD0000_PATH,
                    callback: () => {
                        PageModelManager.getData(CHILD0000_PATH).then(pageModel => {
                            assert.equal(
                                pageModel[Constants.ITEMS_PROP][CHILDXXXX_KEY][Constants.TYPE_PROP],
                                CHILDXXXX_TYPE);

                            const order = pageModel[Constants.ITEMS_ORDER_PROP];
                            assert.equal(
                                order.indexOf('childXXXX') - 1,
                                order.indexOf('child0010'));

                            done();
                        });
                    }
                });

                dispatchEvent_PageModelUpdate('insertAfter', CHILD0010_PATH, {
                    key: CHILDXXXX_KEY,
                    value: {
                        ':type': CHILDXXXX_TYPE
                    }
                });
            });
        });

        it('should delete child0010 when triggered with the "delete" cmd', done => {
            PageModelManager.addListener({
                dataPath: CHILD0000_PATH,
                callback: () => {
                    PageModelManager.getData(CHILD0000_PATH).then(pageModel => {
                        assert.equal(
                            pageModel[Constants.ITEMS_ORDER_PROP].indexOf('child0010'),
                            -1);

                        done();
                    });
                }
            });

            dispatchEvent_PageModelUpdate('delete', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });
        });

        it('should replace child0010 when triggered with the "replace" cmd', done => {
            PageModelManager.addListener({
                dataPath: CHILD0010_PATH,
                callback: () => {
                    PageModelManager.getData(CHILD0010_PATH).then(pageModel => {
                        assert.equal(
                            pageModel[Constants.TYPE_PROP],
                            CHILDXXXX_TYPE);

                        done();
                    });
                }
            });

            dispatchEvent_PageModelUpdate('replace', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });
        });

        describe('when triggered with the "move" cmd', () => {

            it('should move child0010 after child0011', done => {
                PageModelManager.addListener({
                    dataPath: CHILD0000_PATH,
                    callback: () => {
                        PageModelManager.getData(CHILD0000_PATH).then(pageModel => {
                            const order = pageModel[Constants.ITEMS_ORDER_PROP];

                            if (order.indexOf('child0010') + 1 === order.indexOf('child0011')) {
                                done();
                            }
                        });
                    }
                });

                dispatchEvent_PageModelUpdate('moveAfter', CHILD0010_PATH, {
                    key: 'child0010',
                    sibling: 'child0011'
                });
            });

            it('should move child0011 before child0010', done => {
                PageModelManager.addListener({
                    dataPath: CHILD0000_PATH,
                    callback: () => {
                        PageModelManager.getData(CHILD0000_PATH).then(pageModel => {
                            const order = pageModel[Constants.ITEMS_ORDER_PROP];

                            assert.equal(order.indexOf('child0010') + 1, order.indexOf('child0011'));

                            done();
                        });
                    }
                });

                dispatchEvent_PageModelUpdate('moveBefore', CHILD0010_PATH, {
                    key: 'child0011',
                    sibling: CHILD0010_PATH
                });
            });
        });
    });

    describe('listeners ->', () => {

        beforeEach(() => {
            return PageModelManager.init();
        });

        it('should be notified when updating the model', done => {
            PageModelManager.addListener({
                dataPath: CHILD0000_PATH,
                callback: done
            });

            dispatchEvent_PageModelUpdate('insertAfter', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });
        });

        it('should be notified when reloading the model', done => {
            PageModelManager.addListener({
                dataPath: CHILD0000_PATH,
                callback: done
            });

            PageModelManager.getData({
                dataPath: CHILD0000_PATH,
                forceReload: true
            });
        });

        it('should notify the page listeners a page model has been added', (done) => {
            PageModelManager.addListener({
                pagePath: CUSTOM_PAGE_MODEL_PATH,
                dataPath: '',
                callback: done
            });

            PageModelManager.getData({
                pagePath: CUSTOM_PAGE_MODEL_PATH,
                dataPath: ''
            });
        });

        it('should notify the root listeners a page model has been added', (done) => {
            PageModelManager.addListener({
                pagePath: '',
                dataPath: '',
                callback: done
            });

            PageModelManager.getData({
                pagePath: CUSTOM_PAGE_MODEL_PATH,
                dataPath: ''
            });
        });
    });
});
