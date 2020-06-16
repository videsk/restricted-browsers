const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'restricted-browsers.min.js',
    library: 'RestrictedBrowsers',
  },
  module: {
    rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015'],
          },
        },
    ],
  },
  stats: {
    colors: true,
  },
  devtool: 'source-map',
};
