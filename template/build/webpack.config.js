const debug = require('debug')('app:webpack.config')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const VueSSRServerPlugin = require('vue-server-renderer/server-plugin'); //vue服务端渲染插件
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin') // client manifest preload
const ROOT_PATH = path.resolve(__dirname, '..')
const PROJECT_NAME = process.env.PROJECT_NAME || '{{ name }}'
const NODE_ENV = process.env.NODE_ENV || 'local'
const SERVER_RENDER = process.env.SERVER_RENDER || false

// for html webpack plugin not working with webpack-dev-server
const publicPath = SERVER_RENDER ? '/static/' : '/'
const filename = '[name].js'

debug(`Webpack running environment [${NODE_ENV}]`)
debug(`Webpack running client folder [${ROOT_PATH}]`)
debug(`Webpack running project name [${PROJECT_NAME}]`)
debug(`Webpack running server render [${SERVER_RENDER}]`)

const baseConfig = {
  devtool: '#cheap-module-eval-source-map',
  context: ROOT_PATH,
  output: {
    path: path.join(ROOT_PATH, 'dist'),
    publicPath: publicPath,
    filename: '[name].js',
  },
  devServer: {
    disableHostCheck: true,
    host: '127.0.0.1',
    port: process.env.PORT || 8080,
    contentBase: path.join(ROOT_PATH, 'src'),
    historyApiFallback: true,
    stats: 'normal',
  },
  module: {
    loaders: [{
      test: /\.vue$/,
      loader: 'vue-loader',
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        presets: ['es2015', 'stage-0'],
        plugins: ['transform-runtime'],
      },
      exclude: /node_modules/,
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'file-loader',
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

const clientConfig = webpackMerge(baseConfig, {
  entry: {
    [PROJECT_NAME]: path.join(ROOT_PATH, 'src', 'entry-client'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(ROOT_PATH, 'src', 'index.html'),
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: '{{ name }}.template.html',
      template: path.join(ROOT_PATH, 'src', 'index.html'),
      inject: false,
    }),
    new VueSSRClientPlugin({
      filename: `${PROJECT_NAME}.client.1.json`,
    })
  ],
})

const serverConfig = webpackMerge(baseConfig, {
  target: 'node',
  entry: {
    [PROJECT_NAME]: path.join(ROOT_PATH, 'src', 'entry-server'),
  },
  output: {
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new VueSSRServerPlugin({
      filename: `${PROJECT_NAME}.server.1.json`,
    }),
  ],
})

if (SERVER_RENDER) {
  module.exports = [clientConfig, serverConfig]
} else {
  module.exports = clientConfig
}
