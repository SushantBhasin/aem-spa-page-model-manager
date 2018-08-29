import ModelManager from '../src/ModelManager';
import {ModelStore} from '../src/ModelStore';
import {ModelClient} from '../src/ModelClient';
import {PathUtils} from '../src/PathUtils';
import {PAGE_MODEL, content_test_page_root_child0000_child0010} from './data/MainPageData';

describe('ModelManager ->', () => {

    const CHILD_PATH = '/content/test/page/root/child0000/child0010';

    let modelStoreStub;
    let modelClientStub;

    beforeEach('stub modelManager and modelClient', () => {

        modelStoreStub = sinon.createStubInstance(ModelStore);
        modelStoreStub.initialize.callThrough();

        //
        modelClientStub = sinon.createStubInstance(ModelClient);
        modelClientStub.fetch.withArgs(CHILD_PATH).returns(Promise.resolve(content_test_page_root_child0000_child0010));
        modelClientStub.fetch.returns(Promise.resolve(PAGE_MODEL));
    });

    afterEach('restore modelManager and modelClient', () => {
        modelStoreStub.initialize.restore();

        modelClientStub.fetch.restore();
    });

    describe('when there is no data in ModelStore -- ', () => {

        beforeEach('stub getData', () => {
            modelStoreStub.getData.withArgs().returns(PAGE_MODEL);
            modelStoreStub.getData.withArgs('/content/test/page').returns();
            modelStoreStub.getData.withArgs(CHILD_PATH).returns();
        });

        afterEach('restore getData', () => {
            modelStoreStub.getData.restore();
        });


        it('should fetch data on initialization', () => {
            return ModelManager.initialize(modelStoreStub, modelClientStub, '/content/test/page').then((data) => {
                assert.isOk(modelStoreStub.initialize.calledOnce, 'ModelStore.initialize called');
                assert.isOk(modelClientStub.fetch.calledOnce, 'ModelClient.fetch called');
                assert.equal(2, modelStoreStub.getData.callCount, 'ModelStore.getData called');
                assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
            });
        });

        describe('when the request is for an asynchronous subpage -- ', () => {

            beforeEach('stub PathUtils', () => {
                sinon.stub(PathUtils, 'getCurrentPathname').returns('/content/test/pageNotInModel');
                sinon.stub(PathUtils, 'getMetaPropertyValue').returns('/content/test/');
            });

            afterEach('restore getData', () => {
                PathUtils.getCurrentPathname.restore();
                PathUtils.getMetaPropertyValue.restore();
            });

            it('should fetch data twice on initialization', () => {
                return ModelManager.initialize(modelStoreStub, modelClientStub, '/content/test/page').then((data) => {
                    assert.isOk(modelStoreStub.initialize.calledOnce, 'ModelStore.initialize called');
                    assert.equal(2, modelClientStub.fetch.callCount, 'ModelClient.fetch called');
                    assert.equal(2, modelStoreStub.getData.callCount, 'ModelStore.getData called');
                    assert.isOk(modelStoreStub.insertData.calledOnce, 'ModelStore.insertData called');
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });
        });
    });

    describe('when there is data in ModelStore -- ', () => {

        beforeEach('stub getData', () => {
            modelStoreStub.getData.withArgs().returns(PAGE_MODEL);
            modelStoreStub.getData.withArgs('/content/test/page').returns(PAGE_MODEL);
            modelStoreStub.getData.withArgs(CHILD_PATH).returns(content_test_page_root_child0000_child0010);
        });

        afterEach('restore getData', () => {
            modelStoreStub.getData.restore();
        });

        it('should not fetch data on initialization', () => {
            return ModelManager.initialize(modelStoreStub, modelClientStub, '/content/test/page').then((data) => {
                assert.isNotOk(modelStoreStub.initialize.called, 'ModelStore.initialize not called');
                assert.isNotOk(modelClientStub.fetch.called, 'ModelClient.fetch not called');
                assert.isOk(modelStoreStub.getData.calledOnce, 'ModelStore.getData called');
                assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
            });
        });

        it('should not fetch data', () => {
            return ModelManager.initialize(modelStoreStub, modelClientStub, '/content/test/page').then(() => {

                return ModelManager.getData(CHILD_PATH).then((data) => {
                    assert.isNotOk(modelClientStub.fetch.called, 'ModelClient.fetch not called');
                    assert.equal(2, modelStoreStub.getData.callCount, 'ModelStore.getData called');
                    assert.deepEqual(data, content_test_page_root_child0000_child0010, 'data should be correct');
                });
            });
        });

        it('should fetch data if forced', () => {
            return ModelManager.initialize(modelStoreStub, modelClientStub, '/content/test/page').then(() => {

                return ModelManager.getData({path:CHILD_PATH, forceReload: true}).then((data) => {
                    assert.isOk(modelClientStub.fetch.calledOnce, 'ModelClient.fetch called');
                    assert.isOk(modelStoreStub.getData.calledOnce, 'ModelStore.getData called');
                    assert.deepEqual(data, content_test_page_root_child0000_child0010, 'data should be correct');
                });
            });
        });


    });
});
