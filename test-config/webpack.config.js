const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FECWebpackDevServerPlugin = require('../lib/dev-server-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, '../demo/index.js'),
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: 'app.[contenthash].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../demo/index.html')
        }),
        new CleanWebpackPlugin({
            verbose: true,
        }),
        new FECWebpackDevServerPlugin()
    ]
}