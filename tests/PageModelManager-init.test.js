import PageModelManager from '../index.js';

describe('PageModelManager default initialization', () => {

    const ITEMS_META_DATA = ':items';

    const DEFAULT_PAGE_MODEL_PATH = window.location.pathname.replace(/\.htm(l)?$/,'.model.json');

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


    let server;

    before(() => {
        server = sinon.fakeServer.create();
        server.autoRespond = true;

        server.respondWith("GET", DEFAULT_PAGE_MODEL_PATH,
            [200, { "Content-Type": "application/json" }, JSON.stringify(PAGE_MODEL_JSON)]);
    });

    after(() => {
        server.restore();
    });

    describe('getting the default page model ->', () => {

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
                assert.deepEqual(PAGE_MODEL_JSON[ITEMS_META_DATA]['root'], model, 'Unexpected root model');
                done();
            }, () => {
                done(false, 'promise rejected');
            });
        });

    });

});
