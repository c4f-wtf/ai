const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const flowRemoveTypes = require('flow-remove-types');
const EsmWebpackPlugin = require('@purtuga/esm-webpack-plugin');
const glob = require('glob');

const alias = require('./webpack.alias.js');

function addScenarioModules(entry = {}) {
    const files = glob.sync(path.join(__dirname, 'src/scenario/*/scenario.js'));
    for(const file of files){
        const path = file.replace(__dirname, '.');
        const name = path.replace(/(\.\/src\/|\.js)/g, '')
        entry[name] = path;
    }
    return entry;
}

module.exports = {
    entry: addScenarioModules({
        'lib/prolog': './src/lib/tau-prolog.js',
        'lib/tf': './src/lib/tf.js',
    }),

    output: {
        filename: '[name].js',
        library: 'LIB',
        libraryTarget: 'var',
    },

    resolve: {
        alias,
        extensions: ['.js'],
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.css$/,
                loader: 'lit-css-loader'
            },
        ]
    },

    plugins: [
        new CopyPlugin([
            {
                from: './src/scenario/*/assets/*',
                to: 'assets/[1]/[name].[ext]',
                test: /([^/]+)\/assets\/[^/]+$/,
            }
        ]),
        new EsmWebpackPlugin(),
    ],
};