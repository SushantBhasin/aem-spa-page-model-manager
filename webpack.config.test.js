var path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './index.js',
    mode: 'development',
    devtool: 'source-map',
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
        ].concat({
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            use: {
                loader: 'istanbul-instrumenter-loader',
                options: { esModules: true }
            },
            enforce: 'post'
        })
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};
