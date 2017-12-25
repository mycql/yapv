'use strict';

const DIR = {
  DIST: 'dist',
  SRC_MAIN: 'src/main/'
};

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const packageInfo = require(path.resolve(__dirname, 'package.json'));
const hashed = process.env.hashed || 'true';
const doHash = hashed === 'true';
const distName = doHash ? `${packageInfo.name}.[chunkhash]` : `${packageInfo.name}-${packageInfo.version}`;
const entryBundleName = `[name].${distName}.js`;

const metadata = {
  title: 'Web Plasmid'
};

const config  = {
  entry: {
    Render: path.resolve(__dirname, `${DIR.SRC_MAIN}/script/index.ts`),
    Canvas: path.resolve(__dirname, `${DIR.SRC_MAIN}/script/component/circular/renderer/canvas/index.ts`),
    SVG: path.resolve(__dirname, `${DIR.SRC_MAIN}/script/component/circular/renderer/svg/index.tsx`)
  },
  output: {
    path: path.resolve(__dirname, DIR.DIST),
    filename: entryBundleName,
    chunkFilename: entryBundleName,
    libraryTarget: 'umd',
    library: ['WebPlasmid', '[name]']
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