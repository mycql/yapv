'use strict';

const DIR = {
  DIST: 'dist',
  DIST_SCRIPT: 'scripts',
  SRC_MAIN: 'src/'
};

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const packageInfo = require(path.resolve(__dirname, 'package.json'));
const hashed = process.env.hashed || 'true';
const doHash = hashed === 'true';
const distName = doHash ? `${packageInfo.name}.[chunkhash]` : `${packageInfo.name}-${packageInfo.version}`;
const entryBundleName = `${DIR.DIST_SCRIPT}/[name].${distName}.js`;

const metadata = {
  title: 'Web Plasmid'
};

const config  = {
  entry: {
    app: path.resolve(__dirname, `${DIR.SRC_MAIN}/script/main.ts`),
  },
  output: {
    path: path.resolve(__dirname, DIR.DIST),
    filename: entryBundleName,
    chunkFilename: entryBundleName,
    libraryTarget: 'umd',
    library: 'CanvasPlasmid'
  },
  devtool: 'inline-source-map',
  target: 'web',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [
      'node_modules',
      path.resolve(__dirname, DIR.SRC_MAIN)
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: {
              typeCheck: true
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'babel-loader' },
          { loader: 'ts-loader' }
        ],
        exclude: /node_modules/
      }
      /*,
      {
        test: /\.s?css$/,
        use: [
          'css-loader',
          'postcss-loader'
        ]
      }
      */
    ]
  },

  plugins: [
    new CleanWebpackPlugin([DIR.DIST]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, `examples/index.html`),
      chunksSortMode: 'dependency',
      xhtml: false,
      inject: 'body',
      hash: true,
      metadata: metadata
    }),
    new webpack.HashedModuleIdsPlugin()
  ],
  externals: {
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
  }
};

module.exports = config;