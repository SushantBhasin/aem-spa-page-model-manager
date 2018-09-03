var path = require('path');

var isEnvironmentTest = process.env.NODE_ENV === 'test';
var nodeExternals = require('webpack-node-externals');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './index.js',
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
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
        ].concat(isEnvironmentTest ? {
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            use: {
                loader: 'istanbul-instrumenter-loader',
                options: { esModules: true }
            },
            enforce: 'post'
        } : [])
    },
    externals: [!isEnvironmentTest ? nodeExternals() : ''],
    plugins: [
        new CleanWebpackPlugin(['dist'])
    ]
};