import { PathUtils } from "../src/PathUtils";

describe('PathUtils ->', () => {
    it("join", () => {
        assert.equal(PathUtils.join(["path", "/path1", "//path1"]), "path/path1/path1");
        assert.equal(PathUtils.join([""]), "");
        assert.equal(PathUtils.join([]), "");
        assert.equal(PathUtils.join(), "");
        assert.equal(PathUtils.join(["/path", "path1", "path2"]), "/path/path1/path2");
    });

    it("normalize", () => {
        assert.equal(PathUtils.normalize("path1//path2/path3"), "path1/path2/path3");
        assert.equal(PathUtils.normalize("/path1/path2/path3"), "/path1/path2/path3");
        assert.equal(PathUtils.normalize("pathme"), "pathme");
        assert.equal(PathUtils.normalize(), '');
    });

    it("subpath", () => {
        assert.equal(PathUtils.subpath("path1/path2/path3", "path1"), "path2/path3");
        assert.equal(PathUtils.subpath("path1/path2/path3", "path1/path2"), "path3");
        assert.equal(PathUtils.subpath("path1/path2/path3", "path2/path3"), "path1/path2/path3");
        assert.equal(PathUtils.subpath("/path1/path2/path3", "path1/path2"), "path3");
        assert.equal(PathUtils.subpath("/path1/path2/path3"), "/path1/path2/path3");
        assert.equal(PathUtils.subpath(), "");
    });

    it("makeAbsolute", () => {
        assert.equal(PathUtils.makeAbsolute("path1/path2/path3"), "/path1/path2/path3");
        assert.equal(PathUtils.makeAbsolute("/path1/path2/path3"), "/path1/path2/path3");
        assert.equal(PathUtils.makeAbsolute(""), "");
        assert.equal(PathUtils.makeAbsolute(), "");
    });

    it("makeRelative", () => {
        assert.equal(PathUtils.makeRelative("path1/path2/path3"), "path1/path2/path3");
        assert.equal(PathUtils.makeRelative("/path1/path2/path3"), "path1/path2/path3");
        assert.equal(PathUtils.makeRelative(""), "");
        assert.equal(PathUtils.makeRelative(), "");
    })

    it("splitByDelimitators", () => {
        assert.deepEqual(PathUtils.splitByDelimitators("/path1/path2/delim/path3/path4/delim/path/delim", ["delim"]), ["/path1/path2", "path3/path4", "path"]);
        assert.deepEqual(PathUtils.splitByDelimitators("/path1/path2/delim", []), ["/path1/path2/delim"]);
        assert.deepEqual(PathUtils.splitByDelimitators("delim", ["delim"]), []);
        assert.deepEqual(PathUtils.splitByDelimitators("/path1/path2/delim1/path3/path4/delim2/path5/path6/delim3", ["delim1", "delim2", "delim3"]), ["/path1/path2", "path3/path4", "path5/path6"]);
    });

    it("trimStrings", () => {
        assert.equal(PathUtils.trimStrings("jcr:content/path1/path2", ["jcr:content"]), "path1/path2");
        assert.equal(PathUtils.trimStrings("path1/path2", ["jcr:content"]), "path1/path2");
        assert.equal(PathUtils.trimStrings("path1/path2/jcr:content", ["jcr:content"]), "path1/path2");
        assert.equal(PathUtils.trimStrings("jcr:content/jcr:content/path1/path2/jcr:content/jcr:content/path1/jcr:content/jcr:content", ["jcr:content"]), "path1/path2/jcr:content/jcr:content/path1");
        assert.equal(PathUtils.trimStrings("jcr:content/path1/path2/jcr:content", []), "jcr:content/path1/path2/jcr:content");
        assert.equal(PathUtils.trimStrings("/path1/path2", []), "/path1/path2");
    });
})