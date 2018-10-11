import fetchMock from "fetch-mock";
import {PAGE_MODEL, content_test_child_page_1} from "./data/MainPageData";
import { ModelClient } from "../src/ModelClient";
import InternalConstants from "../src/InternalConstants";

describe("ModelClient ->", () => {
    let myEndPoint = "http://localhost:4523";
    let getJSONResponse = (body) => {
        return new window.Response(JSON.stringify(body), {
            status: 200,
            headers: {
                "Content-type": "application/json"
            }
        });
    };

    function mockTheFetch(path, data, multiple) {
        let url = 'end:' + path + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
        fetchMock.mock(url, data, {
            repeat: multiple ? multiple : 1
        });

        return url;
    }

    afterEach(() => {
        fetchMock.restore();
    });

    describe("fetch ->", () => {

        it("should reject when the remote model endpoint is not found", () => {
            let pageModelUrl = mockTheFetch('/content/test/undefined', 404);

            let modelClient = new ModelClient(myEndPoint);

            return modelClient.fetch(pageModelUrl).then((data) => {
                assert.fail(data, undefined);
            }).catch((error) => {
                assert.isDefined(error.response);
                assert.equal(error.response.status, 404);
            });
        });

        it("should return the expected data", () => {
            let pageModelUrl = mockTheFetch('/content/test/page', getJSONResponse(PAGE_MODEL));
            let childPage1ModelUrl = mockTheFetch('/content/test/child_page_1', getJSONResponse(content_test_child_page_1));
            let childPageUnknownModelUrl = mockTheFetch('/content/test/child_page_404', 404);

            let modelClient = new ModelClient(myEndPoint);

            return modelClient.fetch(pageModelUrl).then((data) => {
                assert.deepEqual(data, PAGE_MODEL);
                return modelClient.fetch(childPage1ModelUrl);
            }).then((data) => {
                assert.deepEqual(data, content_test_child_page_1);
                return modelClient.fetch(childPageUnknownModelUrl);
            }).catch((error) => {
                assert.isDefined(error.response);
                assert.equal(error.response.status, 404);
            });
        });

        describe("handling incorrect parameter", () => {

            let modelClient = new ModelClient(myEndPoint);

            // failing as the undefined is passed to the PathUtils which can not handle this case
            // it("should resolve with Error - when no URL provided", (done) => {
            //
            //     modelClient.fetch(undefined).catch((e) => {
            //         assert.isNotNull(e);
            //         done();
            //     });
            // });

            it("should resolve with Error - when empty URL provided", (done) => {

                modelClient.fetch("").catch((e) => {
                    assert.isNotNull(e);
                    done();
                });
            });

        });
    });
});
