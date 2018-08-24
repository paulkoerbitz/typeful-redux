const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/todos.tsx',
    devtool: 'source-map',
    plugins: [new HtmlWebpackPlugin({
        title: "Typeful Todos",
        template: "./src/index.html",
        hash: true,
        inject: true
    })],
    output: {
        path: path.join(__dirname, '/dist'),
        filename: "[name].js",
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        modules: ['node_modules']
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: ['node_modules']
        }, {
            test: /\.css$/,
            loader: ['style-loader', 'css-loader']
        }]
    },
    devServer: {
        historyApiFallback: true,
        disableHostCheck: true,
        watchContentBase: false,
        watchOptions: {
            watch: true
        }
    },
};
