'use strict';

const DIR = {
  DIST: 'dist',
  SRC_MAIN: 'src/main'
};
DIR.SRC_RENDERER = {
  CIRCULAR: `${DIR.SRC_MAIN}/script/component/circular/renderer`
};

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const packageInfo = require(path.resolve(__dirname, 'package.json'));
const hashed = process.env.hashed || 'false';
const doHash = hashed === 'true';
const distName = doHash ? `${packageInfo.name}.[name].[chunkhash]` : `${packageInfo.name}.[name]-${packageInfo.version}`;
const entryBundleName = `${distName}.js`;

const metadata = {
  title: 'Yet Another Plasmid Viewer'
};

const config  = {
  entry: {
    ccanvas: path.resolve(__dirname, `${DIR.SRC_RENDERER.CIRCULAR}/canvas/index.ts`),
    csvg: path.resolve(__dirname, `${DIR.SRC_RENDERER.CIRCULAR}/svg/index.tsx`)
  },
  output: {
    path: path.resolve(__dirname, DIR.DIST),
    filename: entryBundleName,
    chunkFilename: entryBundleName,
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: ['YAPV', '[name]']
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