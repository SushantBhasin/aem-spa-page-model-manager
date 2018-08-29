# spa-page-model-manager
The PageModelManager provides access to the model of the page


## Artifactory setup

- Generate / get API key
  - using adobenet credentials log in at https://artifactory.corp.adobe.com/artifactory/webapp/#/profile
  - authorize yourself once more if additional options are locked
  - in authentication settings section generate new API key (if it was not yet generated)
  - copy key to clipboard
  
- Generate registry information
```sh
$ scope=adobe
$ repository=cq-spa
$ user=username # use your adobenet login here!
$ key=$(pbpaste)
$ curl -u "$user:$key" "https://artifactory.corp.adobe.com/artifactory/api/npm/npm-${repository}-release/auth/${scope}"
```

You should get output similar to:
```
@adobe:registry=https://artifactory.corp.adobe.com:443/artifactory/api/npm/npm-cq-spa-release/
//artifactory.corp.adobe.com:443/artifactory/api/npm/npm-cq-spa-release/:_password=(...)
//artifactory.corp.adobe.com:443/artifactory/api/npm/npm-cq-spa-release/:username=(username)
//artifactory.corp.adobe.com:443/artifactory/api/npm/npm-cq-spa-release/:email=(username)@adobe.com
//aortifactory.corp.adobe.com:443/artifactory/api/npm/npm-cq-spa-release/:always-auth=true
```

If everything looks correct you should add given output to global npm configuration `~/.npmrc` (or to `.npmrc` in the root of the project)
```sh
$ curl -u "$user:$key" "https://artifactory.corp.adobe.com/artifactory/api/npm/npm-${repository}-release/auth/${scope}" >> ~/.npmrc
```

Note that `npm-cq-spa-release` is a virtual repository that aggregates both the local private repository `npm-cq-spa-release-local` and the npm public repository https://registry.npmjs.org (see https://www.npmjs.com/search?q=cq-spa)


## Development

Run npm install to get all node_modules that are necessary for development.

### Build

```sh
$ npm run build
```

### Watch to rebuild

```sh
$ npm run build -- --watch
```

### Test

```sh
$ npm run test
```

or
```sh
$ npm run test-debug
```

### Generate docs and readme

To generate the documents in the `/out` folder and pack them in the `DOCUMENTATION.md`:

```sh
$ npm run docs
```

To generate the `README.md` based on the `DOCUMENTATION.md` and `CHANGELOG.md`:
```sh
$ npm run readme
```

### Generate Changelog

```sh
$ auto-changelog
```

### Set current version

```sh
$ npm version X.Y.Z
```
This will (in order):
* `preversion` 
  * run tests and check if `DOCUMENTATION.md` and `README.md` could be generated
* `version` 
  * set the version to `X.Y.Z`
  * generate `DOCUMENTATION.md` and `README.md` for this version
  * commit all the files in one commit named `X.Y.Z` with a tag set to `vX.Y.Z`
* `postversion`
  * push the changes and tag

### Links and transitive dependencies

See the related [wiki page](https://wiki.corp.adobe.com/display/WEM/SPA+-+Working+with+NPM+modules+that+have+a+transitive+dependency)