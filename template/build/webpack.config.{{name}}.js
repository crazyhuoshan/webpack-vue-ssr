const debug = require('debug')('app:webpack.config')
const webpack = require('webpack')
const path = require('path')

const ROOT_PATH = path.resolve(__dirname, '..')

const publicPath = '/static'
const filename = '[name].js'


const {{ name }}Config = {
  devtool: '#cheap-module-eval-source-map',
  context: ROOT_PATH,
  entry: {
    [PROJECT_NAME]: path.join(ROOT_PATH, 'src', 'entry-client'),
  },
  output: {
    path: path.join(ROOT_PATH, 'dist'),
    publicPath: publicPath
    filename: '[name].js',
  },
  devServer: {
    disableHostCheck: true,
    host: '127.0.0.1',
    port: process.env.PORT || 8080,
    publicPath: publicPath,
    contentBase: path.join(ROOT_PATH, 'src'),
    historyApiFallBack: true,
    stats: 'normal',
  },
  module: {
    loaders: [{
      test: /\.vue$/,
      loader: 'vue-loader',
    }],
  },
  plugins: [
  ],
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [path.join(ROOT_PATH, 'node_modules')],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  }
}

module.exports = {{ name }}Config
