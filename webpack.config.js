var path = require('path');

var nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './index.js',
    mode: 'development',
    devtool: 'source-map',
    output: {
        globalObject: `typeof self !== 'undefined' ? self : this`,
        path: path.resolve(__dirname, 'dist'),
        filename: 'cq-spa-page-model-manager.js',
        library: 'cqSpaPageModelManager',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /.js$/,
                exclude: /(node_modules|dist)/,
                use: {
                    loader: 'babel-loader',
                },
                enforce: 'post'
            }
        ]
    },
    externals: [nodeExternals()],
    plugins: [
        new CleanWebpackPlugin()
    ]
};
