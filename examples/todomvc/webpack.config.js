const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function () {
    var plugins = [];
    var externals = {};
    var plugins = [new HtmlWebpackPlugin({
        title: "Example Todo",
        template: "./index.html",
        hash: true,
        inject: true
    })];
    var output = {
        path: path.join(__dirname, '/dist'),
        filename: "[name].js",
    };
    var resolve = {
        extensions: ['.js', '.ts', '.tsx'],
        modules: ['node_modules']
    };
    var modules = {
        loaders: [{
            test: /\.tsx$/,
            loader: 'ts-loader',
            exclude: ['node_modules', 'test', 'script']
        }]
    };
    var devServer = {
        historyApiFallback: true,
        contentBase: path.join(__dirname),
        disableHostCheck: true,
        watchContentBase: false,
        watchOptions: {
            watch: true
        }
    };
    return {
        entry: './todos.tsx',
        devtool: 'source-map',
        output: output,
        resolve: resolve,
        module: modules,
        externals: externals,
        plugins: plugins
    };
};
