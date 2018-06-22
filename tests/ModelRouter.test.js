import {PageModelManager} from '../index';
import InternalConstants from '../src/InternalConstants';
import EventType from "../src/EventType";

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
    const MODEL_ROUTER_PROPERTY_NAME = 'cq:page_model_router';
    const MODEL_ROUTER_META_SELECTOR = 'meta[property="' + MODEL_ROUTER_PROPERTY_NAME + '"]';

    const PAGE_MODEL_JSON = {
        "title": "React sample page - Model Router",
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

    let sandbox = sinon.createSandbox();

    describe('history ->', () => {

        const QUERY_MODEL_PATH = "/abc/123";
        const HASH_MODEL_PATH = "/def/456";
        const SUFFIX_MODEL_PATH = "/ghi/789";
        const CONTENT_CHILD_MODEL_PATH = "/child/page";

        let server;

        /**
         * Sets the <i>cq:page_model_router</i> meta property with the given type
         *
         * @param {string} type   - type of model routing
         */
        function setModelRouterType(type) {
            let modelRouterMeta = document.head.querySelector(MODEL_ROUTER_META_SELECTOR);

            if (undefined === type) {
                if (modelRouterMeta) {
                    document.head.removeChild(modelRouterMeta);
                    modelRouterMeta = null;
                }

                return;
            }

            if (!modelRouterMeta) {
                modelRouterMeta = document.createElement('meta');
                modelRouterMeta.setAttribute('property', MODEL_ROUTER_PROPERTY_NAME);
                document.head.appendChild(modelRouterMeta);
            }

            modelRouterMeta.content = type;
        }

        /**
         * Sets a new mocked server entry point for the given model path and adds an entry in the provided map
         *
         * @param {{}} map                      - map object to which add a new model configuration entry
         * @param {string} path                 - path of the model
         * @param {string} pushStateUrl         - url to be passed to the {@link history.pushState} function
         * @param {string} modelPath            - path of the model
         * @param {boolean} withModel           - should a model object be populated
         */
        function mapRemoteModelPath(map, path, pushStateUrl, modelPath, withModel) {
            map[path] = {pushStateUrl: pushStateUrl, modelPath: modelPath};

            let model = {};

            if (withModel) {
                map[path].model = model = {path: path};
            }

            server.respondWith("GET", modelPath + ".model.json",
                [200, { "Content-Type": "application/json" }, JSON.stringify(model)]);
        }

        /**
         * Maps a series of URL archetype where the model path is including in different location
         *
         * @param {string} namespace            - namespace under which the model path should be located to avoid conflicts and pre-cached objects
         * @param {{}} modelPathConfig          - configuration object to configure the creation of the remote model
         *
         * @returns the Map of all the mapped model paths
         */
        function mapRemoteModelPaths(namespace, modelPathConfig) {
            let map = {};

            mapRemoteModelPath(map, DEFAULT_PAGE_MODEL_PATH, DEFAULT_PAGE_MODEL_PATH, DEFAULT_PAGE_MODEL_PATH, modelPathConfig.root);

            const localContentPathModelPath = DEFAULT_PAGE_MODEL_PATH + '/' + namespace + CONTENT_CHILD_MODEL_PATH;
            mapRemoteModelPath(map, localContentPathModelPath, localContentPathModelPath, localContentPathModelPath, modelPathConfig.content);

            const localSuffixModelPath = '/' + namespace + SUFFIX_MODEL_PATH;
            mapRemoteModelPath(map, DEFAULT_PAGE_MODEL_PATH + '.html' + localSuffixModelPath, DEFAULT_PAGE_MODEL_PATH + '.html' + localSuffixModelPath, localSuffixModelPath, modelPathConfig.suffix);

            const localHashModelPath = '/' + namespace + HASH_MODEL_PATH;
            mapRemoteModelPath(map, DEFAULT_PAGE_MODEL_PATH + '#' + localHashModelPath, '#' + localHashModelPath, localHashModelPath, modelPathConfig.hash);

            const localParameterModelPath = '/' + namespace + QUERY_MODEL_PATH;
            mapRemoteModelPath(map, DEFAULT_PAGE_MODEL_PATH + '?page=' + localParameterModelPath, '?page=' + localParameterModelPath, localParameterModelPath, modelPathConfig.parameter);

            return map;
        }

        /**
         * Tests a model route change
         *
         * @param {string|undefined} modelRouterType            - Type of model routing
         * @param {string} namespace                            - namespace under which the model path should be located to avoid conflicts and pre-cached objects
         * @param {{}} modelPathConfig                          - configuration object to configure the creation of the remote model
         * @return {Promise}
         */
        function testModelRouteChanged(modelRouterType, namespace, modelPathConfig) {
            const map = mapRemoteModelPaths(namespace, modelPathConfig);

            setModelRouterType(modelRouterType);

            let i = -1;

            let promises = [];
            let promiseResolves = {};

            function onModelRouteChanged(event) {
                let path = event.detail.model.path;
                // For the test to succeed:
                // 1. a promise resolve function has been registered for the given path
                // 2. the model contains the expected path
                let resolve = promiseResolves[path];

                if (resolve) {
                    assert.deepEqual(map[path].model, event.detail.model);
                    resolve();
                }
            }

            window.addEventListener(EventType.PAGE_MODEL_ROUTE_CHANGED, onModelRouteChanged, false);

            // One promise per mapped model path
            for (let key in map) {
                i++;

                promises.push(new Promise((resolve) => { promiseResolves[key] = resolve; }));

                if (!map.hasOwnProperty(key)) {
                    continue;
                }

                // As there is no model object we expect no request
                if (!map[key].model) {
                    promiseResolves[key]();
                    continue;
                }

                // the popstate event isn't triggered when calling the pushState function
                // a navigation action such as back must occur
                history.pushState({key: i}, "page " + i, map[key].pushStateUrl);
            }

            let finalResolve;
            let finalPromise = new Promise((resolve) => {
                finalResolve = resolve;
            });

            Promise.all(promises).then(() => {
                // clean-up the event queue to reduce down potential side effects
                window.removeEventListener(EventType.PAGE_MODEL_ROUTE_CHANGED, onModelRouteChanged);

                finalResolve();
            });

            return finalPromise;
        }

        beforeEach(() => {
            server = sinon.fakeServer.create();
            server.respondImmediately = true;

            sinon.spy(PageModelManager, 'getData');

            server.respondWith("GET", DEFAULT_PAGE_MODEL_PATH + ".model.json",
                [200, { "Content-Type": "application/json" }, JSON.stringify(PAGE_MODEL_JSON)]);

            return PageModelManager.init();
        });

        afterEach(() => {
            PageModelManager.getData.restore();

            let modelRouterMeta = document.head.querySelector(MODEL_ROUTER_META_SELECTOR);

            if (modelRouterMeta) {
                modelRouterMeta.content = '';
            }

            history.pushState({index: 0}, "default page ", DEFAULT_PAGE_MODEL_PATH);
        });

        describe('content path ->', () => {

            const MODEL_PATH_CONFIG = {
                root: false,
                content: true,
                suffix: false,
                hash: false,
                parameter: false
            };

            it('should fetch the model based on a path provided as the default content path', () => {
                return testModelRouteChanged(undefined, 'default-content-path-type', MODEL_PATH_CONFIG);
            });

            it('should fetch the model based on a path provided as a specified content path', () => {
                return testModelRouteChanged('path', 'content-path-type', MODEL_PATH_CONFIG);
            });
        });
    });
});
