const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'cheap-module-eval-source-map ',
  devServer: {
    contentBase: './dist',
    compress: true,
    inline: true,
    open: true,
    overlay: {
      warnings: true,
      errors: true
    }
  }
});