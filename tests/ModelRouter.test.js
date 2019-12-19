import { getModelPath, dispatchRouteChanged, routeModel, getRouteFilters, isModelRouterEnabled, isRouteExcluded, ROUTER_MODES } from '../src/ModelRouter';
import ModelManager from '../src/ModelManager';
import { PathUtils } from '../src/PathUtils';
import MetaProperty from '../src/MetaProperty';

describe('ModelRouter ->', () => {

    const DEFAULT_PAGE_MODEL_PATH = window.location.pathname.replace(/\.htm(l)?$/,'');
    const TEST_PATH = '/test';
    const TEST_MODEL = {test: 'model'};
    const MODEL_ROUTE_FILTERS = ['f1', 'f2', 'f3'];
    const MODEL_ROUTE_FILTERS_STR = MODEL_ROUTE_FILTERS.join(',');

    describe('getModelPath ->', () => {

        it('should get the current window URL', () => {
            expect(getModelPath()).to.equal(DEFAULT_PAGE_MODEL_PATH);
        });

        it('should get the current window URL', () => {
            expect(getModelPath('/path.model.json')).to.equal('/path');
        });

        it('should get the current window URL', () => {
            expect(getModelPath('/zyx/abc?test=test')).to.equal('/zyx/abc');
        });

    });

    describe('dispatchRouteChanged ->', () => {

        beforeEach(() => {
            sinon.stub(ModelManager, 'getData');

            ModelManager.getData.resolves(TEST_MODEL);
        });

        afterEach(() => {
            ModelManager.getData.restore();
        });

        it('should get the current window URL', () => {
            dispatchRouteChanged(TEST_PATH);

            expect(ModelManager.getData.calledWithExactly({path: TEST_PATH})).to.be.true;
        });

    });

    describe('routeModel ->', () => {

        beforeEach(() => {
            sinon.stub(ModelManager, 'getData');

            ModelManager.getData.resolves(TEST_MODEL);
        });

        afterEach(() => {
            ModelManager.getData.restore();
        });

        it('should route the model based on the window URL', () => {
           routeModel();

            expect(ModelManager.getData.calledWithExactly({path: DEFAULT_PAGE_MODEL_PATH})).to.be.true;
        });

        it('should route the model based on provided path', () => {
            routeModel(TEST_PATH);

            expect(ModelManager.getData.calledWithExactly({path: TEST_PATH})).to.be.true;
        });
    });

    describe('getRouteFilters ->', () => {

        beforeEach(() => {
            sinon.stub(PathUtils, 'getMetaPropertyValue');
        });

        afterEach(() => {
            PathUtils.getMetaPropertyValue.restore();
        });

        it('should return an empty list of route filters', () => {
            expect(getRouteFilters()).to.eql([]);
        });

        it('should return a list of route filters', () => {
            PathUtils.getMetaPropertyValue.withArgs(MetaProperty.PAGE_MODEL_ROUTE_FILTERS).returns(MODEL_ROUTE_FILTERS_STR);

            expect(getRouteFilters()).to.have.all.members(MODEL_ROUTE_FILTERS);
        });
    });

    describe('isModelRouterEnabled ->', () => {

        beforeEach(() => {
            sinon.stub(PathUtils, 'getMetaPropertyValue');
        });

        afterEach(() => {
            PathUtils.getMetaPropertyValue.restore();
        });

        it('should return an enabled route model by default', () => {
            expect(isModelRouterEnabled()).to.be.true;
        });

        it('should return a disabled route model', () => {
            PathUtils.getMetaPropertyValue.withArgs(MetaProperty.PAGE_MODEL_ROUTER).returns(ROUTER_MODES.DISABLED);

            expect(isModelRouterEnabled()).to.be.false;
        });
    });

    describe('isRouteExcluded ->', () => {

        beforeEach(() => {
            sinon.stub(PathUtils, 'getMetaPropertyValue');
        });

        afterEach(() => {
            PathUtils.getMetaPropertyValue.restore();
        });

        it('should filter a route', () => {
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[0])).to.be.false;
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[1])).to.be.false;
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[2])).to.be.false;
        });

        it('should filter a route', () => {
            PathUtils.getMetaPropertyValue.withArgs(MetaProperty.PAGE_MODEL_ROUTE_FILTERS).returns(MODEL_ROUTE_FILTERS_STR);
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[0])).to.be.true;
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[1])).to.be.true;
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[2])).to.be.true;
        });
    });
});
