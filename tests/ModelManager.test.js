import fetchMock from "fetch-mock";
import ModelManager from '../src/ModelManager';
import {ModelClient} from '../src/ModelClient';
import {PathUtils} from '../src/PathUtils';
import {PAGE_MODEL, content_test_page_root_child0000_child0010} from './data/MainPageData';
import MetaProperty from "../src/MetaProperty";
import InternalConstants from "../src/InternalConstants";
import EventType from "../src/EventType";
import {getRouteFilters} from "../src/ModelManager";

describe('ModelManager ->', () => {

    const PAGE_PATH = '/content/test/page';

    const PAGE_MODEL_URL = PAGE_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;

    const CHILD_PATH = PAGE_PATH + '/jcr:content/root/child0000/child0010';
    const CHILD_MODEL_URL = CHILD_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
    const MODEL_ROUTE_FILTERS = ['f1', 'f2', 'f3'];
    const MODEL_ROUTE_FILTERS_STR = MODEL_ROUTE_FILTERS.join(',');

    let sandbox = sinon.createSandbox();

    let modelClientStub;

    let PAGE_MODEL_LOAD_EVENT_OPTIONS = {
        detail: {
            model: PAGE_MODEL
        }
    };

    function expectPageModelLoadedEventFired() {
        expect(PathUtils.dispatchGlobalCustomEvent).to.have.been.calledOnce.and.to.have.been.calledWithMatch(EventType.PAGE_MODEL_LOADED, PAGE_MODEL_LOAD_EVENT_OPTIONS);
    }

    function mockTheFetch(path, data, multiple) {
        let url = 'end:' + path;
        fetchMock.mock(url, data, {
            repeat: multiple ? multiple : 1
        });

        return url;
    }

    beforeEach('stub modelManager and modelClient', () => {
        modelClientStub = sinon.createStubInstance(ModelClient);
        modelClientStub.fetch.returns(Promise.resolve(PAGE_MODEL));
        modelClientStub.fetch.withArgs(PAGE_MODEL_URL).returns(Promise.resolve(PAGE_MODEL));
        modelClientStub.fetch.withArgs(CHILD_MODEL_URL).returns(Promise.resolve(content_test_page_root_child0000_child0010));

        sandbox.stub(PathUtils, 'getMetaPropertyValue');
        sandbox.stub(PathUtils, 'getCurrentPathname');
        sandbox.stub(PathUtils, 'dispatchGlobalCustomEvent');

        mockTheFetch(PAGE_MODEL_URL, PAGE_MODEL);
    });

    afterEach('restore modelManager and modelClient', () => {
        modelClientStub.fetch.restore();
        sandbox.restore();
        fetchMock.restore();
    });

    describe('getRouteFilters ->', () => {

        it('should return an empty list of route filters', () => {
            expect(getRouteFilters()).to.eql([]);
        });

        it('should return a list of route filters', () => {
            PathUtils.getMetaPropertyValue.withArgs(MetaProperty.PAGE_MODEL_ROUTE_FILTERS).returns(MODEL_ROUTE_FILTERS_STR);
            expect(getRouteFilters()).to.have.all.members(MODEL_ROUTE_FILTERS);
        });
    });

    describe('initialize ->', () => {

        describe('Initialization without config object ->', () => {

            beforeEach(() => {
                modelClientStub.fetch.withArgs(CHILD_MODEL_URL).returns(Promise.resolve(content_test_page_root_child0000_child0010));
            });

            it('should NOT fetch remote data on initialization when the model is provided', () => {
                PathUtils.getMetaPropertyValue.withArgs(MetaProperty.PAGE_MODEL_ROOT_URL).returns(PAGE_MODEL_URL);

                return ModelManager.initialize({model: PAGE_MODEL}).then((data) => {
                    expectPageModelLoadedEventFired();
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });

            it('should fetch remote data on initialization - root path as meta property', () => {
                PathUtils.getMetaPropertyValue.withArgs(MetaProperty.PAGE_MODEL_ROOT_URL).returns(PAGE_MODEL_URL);

                return ModelManager.initialize().then((data) => {
                    expectPageModelLoadedEventFired();
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });

            it('should fetch remote data on initialization - root path as currentPathname', () => {
                PathUtils.getCurrentPathname.returns(PAGE_MODEL_URL);

                return ModelManager.initialize().then((data) => {
                    expectPageModelLoadedEventFired();
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });

            it('should fetch remote data on initialization - root path as a parameter', () => {
                return ModelManager.initialize(PAGE_PATH).then((data) => {
                    expectPageModelLoadedEventFired();
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });

        });

        it('should fetch remote data on initialization', () => {
            return ModelManager.initialize({path: PAGE_PATH, modelClient: modelClientStub}).then((data) => {
                assert.isOk(modelClientStub.fetch.calledOnce, 'ModelClient.fetch called');
                assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
            });
        });

        it("should not make concurrent server calls on duplicate request", () => {
            return ModelManager.initialize({path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClientStub}).then((data) => {
                expectPageModelLoadedEventFired();
                const pathPath = '/content/test/duplicate/request';
                modelClientStub.fetch.withArgs(pathPath + '.model.json').returns(new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({});
                    }, 200);
                }));

                let promises = [];
                promises.push(ModelManager._fetchData(pathPath));
                promises.push(ModelManager._fetchData(pathPath));
                promises.push(ModelManager._fetchData(pathPath));

                return Promise.all(promises).then(() => {
                    for (let i = 0 ; i < promises.length - 1 ; ++i) {
                        assert.equal(promises[i], promises[i + 1]);
                    }
                });
            });
        });

        describe('when the request is for an asynchronous subpage -- ', () => {

            beforeEach('stub PathUtils', () => {
                PathUtils.getCurrentPathname.returns('/content/test/pageNotInModel');
                PathUtils.getMetaPropertyValue.returns('/content/test/');
            });

            it('should fetch data twice on initialization', () => {
                PathUtils.getMetaPropertyValue.withArgs(MetaProperty.PAGE_MODEL_ROUTE_FILTERS).returns(MODEL_ROUTE_FILTERS_STR);

                return ModelManager.initialize({path: PAGE_PATH, modelClient: modelClientStub}).then((data) => {
                    expectPageModelLoadedEventFired();
                    assert.equal(2, modelClientStub.fetch.callCount, 'ModelClient.fetch called');
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });
        });

        it('should not fetch data on initialization', () => {
            return ModelManager.initialize({path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClientStub}).then((data) => {
                expectPageModelLoadedEventFired();
                assert.isNotOk(modelClientStub.fetch.called, 'ModelClient.fetch not called');
                assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
            });
        });

        it('should not fetch data', () => {
            return ModelManager.initialize({path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClientStub}).then(() => {
                expectPageModelLoadedEventFired();

                return ModelManager.getData(CHILD_PATH).then((data) => {
                    assert.isNotOk(modelClientStub.fetch.called, 'ModelClient.fetch not called');
                    assert.deepEqual(data, content_test_page_root_child0000_child0010, 'data should be correct');
                });
            });
        });

        it('should fetch all the data', () => {
            return ModelManager.initialize({path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClientStub}).then(() => {
                expectPageModelLoadedEventFired();

                return ModelManager.getData().then((data) => {
                    assert.isFalse(modelClientStub.fetch.called, 'ModelClient.fetch not called');
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });
        });

        it('should fetch data if forced', () => {
            return ModelManager.initialize({path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClientStub}).then(() => {
                expectPageModelLoadedEventFired();

                return ModelManager.getData({path:CHILD_PATH, forceReload: true}).then((data) => {
                    assert.isOk(modelClientStub.fetch.calledOnce, 'ModelClient.fetch called');
                    assert.deepEqual(data, content_test_page_root_child0000_child0010, 'data should be correct');
                });
            });
        });


    });
});
