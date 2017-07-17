const autoprefixer = require('autoprefixer');
const common = require('./webpack.common');
const path = require('path');
const webpack = require('webpack');

// plugins
const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const DefinePlugin = webpack.DefinePlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;

let data = {
    title: process.env.SITE_TITLE ? process.env.SITE_TITLE : "OmaDextra"
};

module.exports = {
    devtool: 'inline-source-map',

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: [/\.e2e\.ts$/]
            },
            {
              test: /\.pug$/,
              loaders: [
                'html-loader', {
                loader: 'pug-html-loader',
                  options: {
                    doctype: 'html'
                  }
                }
              ]
            },
            {
                test: /\.styl$/,
                include: [path.resolve(__dirname, '../src/app')],
                loader: 'raw-loader!postcss-loader!stylus-loader'
            },
            {
                test: /\.styl$/,
                exclude: [path.resolve(__dirname, '../src/app')],
                include: [path.resolve(__dirname, '../src/styles')],
                loader: ExtractTextPlugin.extract('raw-loader!postcss-loader!stylus-loader')
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('raw-loader!postcss-loader')
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    },

    postcss: common.postcss,

    plugins: [
        new LoaderOptionsPlugin({
            debug: false,
            options: {
                postcss: [
                    autoprefixer({ browsers: ['last 3 versions', 'Firefox ESR'] })
                ],
                resolve: {}
            },
        }),
        new DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('testing')
            }
        }),
        new ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            __dirname
        )
    ],

    resolve: common.resolve,

    node: {
        global: true,
        process: false,
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};
