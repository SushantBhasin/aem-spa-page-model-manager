import Helpers from '../src/Helpers';

describe('Helpers ->', () => {

    describe('getContextPath ->', () => {

        const EXPECTED_CONTEXT_PATH = {
            "/contextpath/content/test.html": "/contextpath",
            "/contextpath1/contextpath2/content/test.html": "/contextpath1/contextpath2",
            "/content/content/test.html": "/content",
            "/content/with/content/test.html": "/content/with",
            "/not/a/context/path/test.html": "",
            "/content/test.html": "",
        };

        it('should detect the context path from the given location', () => {
            for (var location in EXPECTED_CONTEXT_PATH) {
                const contextPath = Helpers.getContextPath(location);
                assert.equal(contextPath, EXPECTED_CONTEXT_PATH[location], "Incorrect context path detected for " + location);
            }
        });

        it('should detect the context path from the current location', () => {
            const contextPath = Helpers.getContextPath();
            assert.equal(contextPath, "", "Incorrect context path detected");
        });
    });

    describe('externalize ->', () => {

        const CONTEXT_PATH = '/contextpath';
        const PATH = '/content/test.html';
        let stub;

        before(() => {
            stub = sinon.stub(Helpers, "getContextPath").callsFake(() => {
                return CONTEXT_PATH;
            });
        });
        after(() => {
            stub.restore();
        });

        it('should prepend the context path on the given path', () => {
            const externalizedPath = Helpers.externalize(PATH);
            assert.equal(externalizedPath, CONTEXT_PATH + PATH);            
        });
    });

    describe('sanitize ->', () => {

        const CONTEXT_PATH = '/contextpath';
        let stub;

        before(() => {
            stub = sinon.stub(Helpers, "getContextPath").callsFake(() => {
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
        }

        it('should return paths that are ready to be stored', () => {
            for (var path in EXPECTED_PATH) {
                const sanitizedPath = Helpers.sanitize(path);
                assert.equal(sanitizedPath, EXPECTED_PATH[path], "Incorrect sanitized path for " + path);
            }
        });
    });
});
