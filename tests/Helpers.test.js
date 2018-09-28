import { PathUtils } from '../src/PathUtils';

describe('PathUtils ->', () => {

    describe('getContextPath ->', () => {

        const EXPECTED_CONTEXT_PATH = {
            "/contextpath/content/test.html": "/contextpath",
            "/contextpath/apps/test.html": "/contextpath",
            "/contextpath/libs/test.html": "/contextpath",
            "/contextpath/etc/test.html": "/contextpath",
            "/contextpath/conf/test.html": "/contextpath",
            "/contextpath1/contextpath2/content/test.html": "/contextpath1/contextpath2",
            "/content/content/test.html": "/content",
            "/content/with/content/test.html": "/content/with",
            "/not/a/context/path/test.html": "",
            "/content/test.html": "",
        };

        it('should detect the context path from the given location', () => {
            for (let keyPath in EXPECTED_CONTEXT_PATH) {
                const contextPath = PathUtils.getContextPath(keyPath);
                assert.equal(contextPath, EXPECTED_CONTEXT_PATH[keyPath], "Incorrect context path detected for " + keyPath);
            }
        });

        it('should detect the context path from the current location', () => {
            const contextPath = PathUtils.getContextPath();
            assert.equal(contextPath, "", "Incorrect context path detected");
        });
    });

    describe('externalize ->', () => {

        const CONTEXT_PATH = '/contextpath';

        let stub;

        const EXPECTED_EXTERNALIZED_PATHS = {
            "/content/test.html": "/contextpath/content/test.html",
            "/apps/test.html": "/contextpath/apps/test.html",
            "/libs/test.html": "/contextpath/libs/test.html",
            "/etc/test.html": "/contextpath/etc/test.html",
            "/conf/test.html": "/contextpath/conf/test.html",
            "/contextpath/content/test.html": "/contextpath/content/test.html",
            "/content/content/test.html": "/contextpath/content/content/test.html",
            "/contextpath/content/with/content/test.html": "/contextpath/content/with/content/test.html",
            "/not/a/context/path/test.html": "/contextpath/not/a/context/path/test.html"
        };

        before(() => {
            stub = sinon.stub(PathUtils, "getContextPath").callsFake(() => {
                return CONTEXT_PATH;
            });
        });

        after(() => {
            stub.restore();
        });

        it('should prepend the context path on the given path', () => {
            for (let keyPath in EXPECTED_EXTERNALIZED_PATHS) {
                if (!EXPECTED_EXTERNALIZED_PATHS.hasOwnProperty(keyPath)) {
                    continue;
                }

                const externalizedPath = PathUtils.externalize(keyPath);
                assert.equal(externalizedPath, EXPECTED_EXTERNALIZED_PATHS[keyPath]);
            }
        });
    });

    describe('internalize ->', () => {

        const CONTEXT_PATH = '/contextpath';

        let stub;

        const EXPECTED_INTERNALIZED_PATHS = {
            "": "",
            "/contextpath/content/test.html": "/content/test.html",
            "/contextpath/apps/test.html": "/apps/test.html",
            "/contextpath/libs/test.html": "/libs/test.html",
            "/contextpath/etc/test.html": "/etc/test.html",
            "/contextpath/conf/test.html": "/conf/test.html",
            "/contextpath1/contextpath2/content/test.html": "/contextpath1/contextpath2/content/test.html",
            "/content/content/test.html": "/content/content/test.html",
            "/content/with/content/test.html": "/content/with/content/test.html",
            "/not/a/context/path/test.html": "/not/a/context/path/test.html",
            "/content/test.html": "/content/test.html",
        };

        before(() => {
            stub = sinon.stub(PathUtils, "getContextPath").callsFake(() => {
                return CONTEXT_PATH;
            });
        });

        after(() => {
            stub.restore();
        });

        it('should return the expected internalized paths', () => {
            for (let path in EXPECTED_INTERNALIZED_PATHS) {
                if (!EXPECTED_INTERNALIZED_PATHS.hasOwnProperty(path)) {
                    continue;
                }

                const internalizedPath = PathUtils.internalize(path);
                assert.equal(internalizedPath, EXPECTED_INTERNALIZED_PATHS[path]);
            }
        });
    });

    describe('sanitize ->', () => {

        const CONTEXT_PATH = '/contextpath';
        let stub;

        before(() => {
            stub = sinon.stub(PathUtils, "getContextPath").callsFake(() => {
                return CONTEXT_PATH;
            });
        });
        after(() => {
            stub.restore();
        });

        const EXPECTED_PATH = {
            "/content/page": "/content/page",
            "/content/page.selector": "/content/page",
            "/contextpath/content/page": "/content/page",
            "http://localhost:4502/content/page.html": "/content/page",
            "http://localhost:4502/contextpath/content/page.html": "/content/page",
            "http://localhost:4502/content/page.selector.html": "/content/page"
        };

        it('should return paths that are ready to be stored', () => {
            for (var path in EXPECTED_PATH) {
                const sanitizedPath = PathUtils.sanitize(path);
                assert.equal(sanitizedPath, EXPECTED_PATH[path], "Incorrect sanitized path for " + path);
            }
        });
    });

    describe("dispatchGlobalCustomEvent", () => {
        it("should dispatch an event", (done) => {
            let detail = {
                a: 1,
                b: { c: 3}
            };
            let eventName = "customEvt";
            window.addEventListener(eventName, (event) => {
                assert.equal(event.type, eventName);
                assert.deepEqual(event.detail, detail, 'Returns the page model object');
                done();
            });

            PathUtils.dispatchGlobalCustomEvent(eventName, { detail });
        });

        it("should not dispatch any event", () => {
            let stub = sinon.stub(PathUtils, "isBrowser").callsFake(() => {
                return false;
            });
            let callback = sinon.spy();
            let eventName = "customEvt";
            window.addEventListener(eventName, callback);

            PathUtils.dispatchGlobalCustomEvent(eventName, {});
            // Dispatching the event will call the listeners syncronously.
            assert.equal(callback.notCalled, true, "The call should not be called");
            stub.restore();
        })
    })
});
