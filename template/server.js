require('babel-register')({
  presets: ['es2015', 'stage-0'], //for es6
  plugins: ['transform-runtime'] // for async await
})

require('babel-polyfill')

require('./lib')
