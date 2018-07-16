require("babel-polyfill");

// Promise rejections aren't handled by mocha at the moment: https://github.com/mochajs/mocha/issues/2640
window.addEventListener('unhandledrejection', function(event) {
    throw new Error(event.reason);
});

var context = require.context('.', true, /\.test\.js$/);
context.keys().forEach(context);

// needed for code coverage, all files from 'dist' folder are reported
var coverageContext = require.context('../dist/', true, /\.js$/);
coverageContext.keys().forEach(coverageContext);
