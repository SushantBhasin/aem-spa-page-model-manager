import {PageModelManager} from '../index';
import InternalConstants from '../src/InternalConstants';

describe('ModelRouter ->', () => {

    const DEFAULT_PAGE_MODEL_PATH = window.location.pathname.replace(/\.htm(l)?$/,'');
    const CUSTOM_PAGE_MODEL_PATH = '/content/custom/path';
    const CUSTOM_PAGE_MODEL_PATH_2 = '/content/custom/path2';
    const FILTERED_PAGE_MODEL_PATH = '/content/exclude/path';
    const EXCLUSION_FILTER = 'route/not/found,^(.*)(?:exclude/path)(.*)';
    const DEFAULT_PAGE_MODEL_URL = DEFAULT_PAGE_MODEL_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
    const CUSTOM_PAGE_MODEL_URL = CUSTOM_PAGE_MODEL_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
    const CUSTOM_PAGE_MODEL_URL_2 = CUSTOM_PAGE_MODEL_PATH_2 + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
    const FILTERED_PAGE_MODEL_URL = FILTERED_PAGE_MODEL_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;

    const PAGE_MODEL_JSON = {
        "title": "React sample page",
        ":type": "we-retail-react/components/structure/page"
    };

    const CUSTOM_PAGE_MODEL_JSON = {
        "title": "React sample page Custom",
        ":type": "we-retail-react/components/structure/page"
    };

    const CUSTOM_PAGE_MODEL_JSON_2 = {
        "title": "React sample page Custom 2",
        ":type": "we-retail-react/components/structure/page"
    };

    const FILTERED_PAGE_MODEL_JSON = {
        "title": "React sample page - filtered",
        ":type": "we-retail-react/components/structure/page"
    };

    describe('hash change ->', () => {

        let server;

        beforeEach(() => {
            window.location.hash = '';
            server = sinon.fakeServer.create();
            server.respondImmediately = true;

            server.respondWith("GET", DEFAULT_PAGE_MODEL_URL,
                [200, { "Content-Type": "application/json" }, JSON.stringify(PAGE_MODEL_JSON)]);

            server.respondWith("GET", CUSTOM_PAGE_MODEL_URL,
                [200, { "Content-Type": "application/json" }, JSON.stringify(CUSTOM_PAGE_MODEL_JSON)]);

            server.respondWith("GET", CUSTOM_PAGE_MODEL_URL_2,
                [200, { "Content-Type": "application/json" }, JSON.stringify(CUSTOM_PAGE_MODEL_JSON_2)]);

            server.respondWith("GET", FILTERED_PAGE_MODEL_URL,
                [200, { "Content-Type": "application/json" }, JSON.stringify(FILTERED_PAGE_MODEL_JSON)]);


            let modelFiltersElement = document.createElement('meta');
            modelFiltersElement.setAttribute('property', 'cq:page_model_route_filters');
            modelFiltersElement.content = EXCLUSION_FILTER;
            document.head.appendChild(modelFiltersElement);

            return PageModelManager.init();
        });

        afterEach(() => {
            // Beware to clear the hash before restoring the sandbox
            window.location.hash = '';

            server.restore();

            let modelFilters = document.querySelector('meta[property="cq:page_model_route_filters"]');
            document.head.removeChild(modelFilters);

            let enableModel = document.querySelector('meta[property="cq:page_model_router"]');

            if (enableModel) {
                document.head.removeChild(enableModel);
            }
        });

        it('should load a new page', () => {
            window.location.hash = '#' + CUSTOM_PAGE_MODEL_PATH;

            assert.isTrue(server.requests.length === 2);
            assert.isTrue(server.requests[0].url === DEFAULT_PAGE_MODEL_URL);
            assert.isTrue(server.requests[1].url === CUSTOM_PAGE_MODEL_URL);
        });

        it('should ignore a the root path', () => {
            window.location.hash = '#/';

            assert.isTrue(server.requests.length === 1);
            assert.isTrue(server.requests[0].url === DEFAULT_PAGE_MODEL_URL);
        });

        it('should ignore a filtered route', () => {
            window.location.hash = '#' + FILTERED_PAGE_MODEL_PATH;

            assert.isTrue(server.requests.length === 1);
            assert.isTrue(server.requests[0].url === DEFAULT_PAGE_MODEL_URL);
        });

        it('should disable the model router', () => {
            let enableModelElement = document.createElement('meta');
            enableModelElement.setAttribute('property', 'cq:page_model_router');
            enableModelElement.content = 'false';
            document.head.appendChild(enableModelElement);

            window.location.hash = '#' + CUSTOM_PAGE_MODEL_PATH;

            assert.isTrue(server.requests.length === 1);
            assert.isTrue(server.requests[0].url === DEFAULT_PAGE_MODEL_URL);
        });
    });
});
