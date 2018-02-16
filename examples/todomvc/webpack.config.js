const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function () {
    var plugins = [];
    var externals = {};
    var plugins = [new HtmlWebpackPlugin({
        title: "Example Todo",
        template: "./src/index.html",
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
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: ['node_modules']
        }, {
            test: /\.css$/,
            loader: ['style-loader', 'css-loader']
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
        entry: './src/todos.tsx',
        devtool: 'source-map',
        output: output,
        resolve: resolve,
        module: modules,
        externals: externals,
        plugins: plugins
    };
};
