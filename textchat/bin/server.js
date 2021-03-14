import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import express from 'express'
import config, { env } from '../config'
import webpackConfig from '../webpack.config'

const app = express()
const { serverPort, rootPath, distPath } = config

if (env.development) {
  const { publicPath } = webpackConfig.output
  const compiler = webpack(webpackConfig)

  app.use(webpackDevMiddleware(compiler, {
    publicPath,
    hot: true,
    lazy: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }))
  app.use(webpackHotMiddleware(compiler))
} else {
  console.log('Server is being run outside of live development mode, meaning it will '
    + 'only serve the compiled application bundle in ~/dist. Generally you '
    + 'do not need an application server for this and can instead use a web '
    + 'server such as nginx to serve your static files. See the "deployment" '
    + 'section in the README for more information on deployment strategies.')
  app.use(express.static(distPath))
}

app.use(express.static(`${rootPath}/public`))

app.listen(serverPort, () => console.log(`Textchat app is listening port ${serverPort}!`))
