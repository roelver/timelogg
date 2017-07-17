const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');

// plugins
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;
const OccurrenceOrderPlugin = webpack.optimize.OccurrenceOrderPlugin;

const extractStyles = new ExtractTextPlugin('assets/css/all[contenthash:16].css');

module.exports = {
    target: 'web',
    cache: true,

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: [
                    'ts-loader',
                    'angular2-router-loader?loader=system&genDir=assets',
                    'angular2-template-loader'
                ],
                exclude: [/\.(spec|e2e)\.ts$/]
            },
            {
              test: /\.html$/,
              loader: 'raw-loader'
            },
            {
                test: /\.css$/,
                include: [
                     path.resolve(__dirname, '../src/app')
                  ],
                loader: 'css-loader'
            },
            // For loading bootstrap.css (in main.ts) and bootstrap's fonts
            {
                test: /\.css$/,
                include: [
                     path.resolve(__dirname, '../node_modules/bootstrap'),
                     path.resolve(__dirname, '../src/styles')
                  ],
                loader: extractStyles.extract([ 'css-loader?sourceMap' ])
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                include: [
                     path.resolve(__dirname, '../src/images')
                ],
                use: [
                  {
                     loader: 'file-loader',
                     options: {
                        hash: 'sha512',
                        digest: 'hex',
                        name: '[name].[ext]',
                        publicPath: '/assets/images/'
                     }
                  },
                  {
                     loader: 'image-webpack-loader',
                     options: {
                        query: {
                           bypassOnDebug: true,
                           mozjpeg: {
                              progressive: true
                           },
                           gifsicle: {
                              interlaced: false
                           },
                           optipng: {
                              optimizationLevel: 7
                           }
                        }
                     }
                }
              ]
            },
            {
               test: /\.png$/,
               loader: "url-loader?mimetype=image/png"
            },
            {
               test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
               loader: 'url-loader?limit=50000&mimetype=application/font-woff'
            },
            {
               test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
               loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            {
               test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
               loader: 'file-loader'
            },
            {
               test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
               loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
            },
            {
               test   : /\.(ttf|eot|svg|woff)(\?[a-z0-9=&.]+)?$/,
               loader : 'file-loader'
            }
        ]
    },

    stats: {
        cached: true,
        cachedAssets: true,
        chunks: true,
        chunkModules: false,
        colors: true,
        hash: false,
        reasons: false,
        timings: true,
        version: false
    },

    entry: {
        'assets/js/main.js': './src/main',
        'assets/js/vendor.js': './src/vendor',
        'assets/js/polyfills.js': './src/polyfills'
    },

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
        new ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            __dirname
        ),
        extractStyles,
        new OccurrenceOrderPlugin(),
        new CommonsChunkPlugin({
            name: [
                'assets/js/main.js',
                'assets/js/vendor.js',
                'assets/js/polyfills.js'
            ]
        }),
        new CopyWebpackPlugin([
            {
                from: 'src/images',
                to: 'assets/images'
            },
            {
                from: 'src/favicon.ico',
                to: 'favicon.ico'
            }
        ]),
        new HtmlWebpackPlugin({
            chunksSortMode: 'auto',
            filename: 'index.html',
            hash: true,
            inject: 'body',
            template: './src/index.html'
       })
    ],

    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [path.resolve('../src'), 'node_modules']
    },

    output: {
        filename: '[name]',
        chunkFilename: 'assets/js/[chunkhash].js',
        path: path.resolve(__dirname, '../target'),
        publicPath: '/'
    },

    node: {
        global: true,
        net: false,
        fs: false,
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};
