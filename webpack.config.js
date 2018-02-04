const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const path = require('path')
const webpack = require('webpack')

const MAIN_FILES_NAME = 'swarm'
const SERVER_PORT = 9000
const DIST_FOLDER = 'docs'
const SRC_FOLDER = 'src'

const isProduction = process.env.NODE_ENV === 'production'

const getPath = filePath => path.resolve(__dirname, filePath)

const extractSassPlugin = new ExtractTextPlugin({
  filename: '[name]-[hash].css',
})

const plugins = [
  new webpack.optimize.AggressiveMergingPlugin({}),
  new webpack.optimize.OccurrenceOrderPlugin(true),
  new HtmlPlugin({
    filename: 'index.html',
    hash: false,
    inject: 'body',
    template: getPath(`./${SRC_FOLDER}/index.html`),
    minify: {
      collapseWhitespace: true,
      minifyJS: true,
      removeComments: true,
    },
  }),
  extractSassPlugin,
]

if (isProduction) {
  plugins.push(new UglifyJsPlugin({
    sourceMap: false,
  }))
}

module.exports = {
  entry: {
    [MAIN_FILES_NAME]: getPath(`./${SRC_FOLDER}/scripts/index.js`),
  },
  output: {
    path: getPath(`./${DIST_FOLDER}`),
    filename: '[name]-[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: getPath(`./${SRC_FOLDER}`),
        loader: 'babel-loader',
      },
      {
        test: /index\.html/,
        loader: 'html-loader',
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 75,
              },
              bypassOnDebug: true,
            },
          },
        ],
      },
      {
        test: /\.wav$/i,
        use: 'file-loader',
      },
      {
        test: /\.scss$/,
        use: extractSassPlugin.extract({
          use: [{
            loader: 'css-loader',
            options: {
              minimize: isProduction,
              sourceMap: false,
            },
          }, {
            loader: 'sass-loader',
          }],
          fallback: 'style-loader',
        }),
      },
    ],
  },
  resolve: {
    modules: [
      'node_modules',
    ],
    extensions: [
      '.js',
      '.scss',
    ],
  },
  devtool: isProduction ? false : 'source-map',
  devServer: {
    compress: true,
    port: SERVER_PORT,
  },
  plugins,
}
