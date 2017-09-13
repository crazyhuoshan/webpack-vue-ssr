import webpack from 'webpack'
import Koa from 'koa'
import koaRouter from 'koa-router'
import program from 'commander'
import packageJson from '../package.json'
import MemoryFS from 'memory-fs'
import path from 'path'
import * as vueServerRenderer from 'vue-server-renderer'
const debug = require('debug')('app:server')

const app = new Koa()
const router = koaRouter()
const fs = new MemoryFS()
const PROJECT_NAME = process.env.PROJECT_NAME || '{{ name }}'
const NODE_ENV = process.env.NODE_ENV || 'local'
const ROOT_PATH = path.resolve(__dirname, '..')
let config = {
  serverBundleFilename: `${PROJECT_NAME}.server.1.json`,
  clientManifestFilename: `${PROJECT_NAME}.client.1.json`,
  htmlTemplateFilename: `${PROJECT_NAME}.template.html`,
  contextTitle: '{{ name }}',
  contextMeta: '<!-- meta -->',
}

program
  .version(packageJson.version)
  .option('-c, --config [config]', 'webpack.config.js', './build/webpack.config.js')
  .option('-s, --serverConfig [serverConfig]', 'server.config.js')
  .parse(process.argv)


if (NODE_ENV !== 'local') {
  throw new Error('This script only work in NODE_ENV === local')
}

if (program.serverConfig) {
  config = Object.assign({}, config, require(program.serverConfig))
}

debug('loading config', program.config)
debug('loading serverConfig', program.serverConfig)
const webpackConfig = require(path.resolve(ROOT_PATH, program.config))
const compiler = webpack(webpackConfig)
const [wc, wcs] = webpackConfig


compiler.outputFileSystem = fs
compiler.run((err, stats) => {
  if (err) throw new Error(err)
  debug(stats.toString({
    chunks: false,
    colors: true,
  }))



  const serverBundleJson = JSON.parse(fs.readFileSync(path.join(wc.output.path, config.serverBundleFilename)).toString())
  const clientManifestJson = JSON.parse(fs.readFileSync(path.join(wc.output.path, config.clientManifestFilename)).toString())
  const htmlTemplate = fs.readFileSync(path.join(wc.output.path, config.htmlTemplateFilename)).toString()
  const staticPath = wc.output.publicPath
  const outputPath = wc.output.path

  // debug('serverBundleJson', serverBundleJson)
  // debug('clientManifestJson', clientManifestJson)
  // debug('htmlTemplate', htmlTemplate)
  // debug(path.join(wc.output.path, 'home.js'))
  // debug(fs.readFileSync(path.join(wc.output.path, 'home.js')))

  createApp({
    serverBundleJson,
    clientManifestJson,
    htmlTemplate,
    staticPath,
    outputPath,
  })
})


function createApp({
  serverBundleJson,
  clientManifestJson,
  htmlTemplate,
  staticPath,
  outputPath,
}) {

  const renderer = vueServerRenderer.createBundleRenderer(serverBundleJson, {
    runInNewContext: false,
    clientManifest: clientManifestJson,
    template: htmlTemplate,
  })

  router.get(`/${staticPath}/*`, async ctx => {
    ctx.body = fs.readFileSync(path.join(outputPath, ctx.path.replace(`/${staticPath}`, '')))
  })


  router.get('*', async ctx => {
    debug('get', ctx.headers.cookie)
    ctx.body = await new Promise((resolve, reject) => {
      renderer.renderToString({
        url: ctx.path,
        querystring: ctx.querystring,
        title: config.contextTitle,
        meta: config.contextMeta,
        cookie: ctx.headers.cookie,
      }, (err, html) => {
        if (err) return reject(err)
        return resolve(html)
      })
    })
  })

  app.use(router.routes())
  app.use(router.allowedMethods())
  app.listen(process.env.PORT || 8080)
  debug(`Now server is listening port ${process.env.PORT || 8080}`)
}
