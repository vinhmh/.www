import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config, { app, env } from '..'
import webpackConfig from '../../webpack.config'

if (env.development) {
  const compiler = webpack(webpackConfig)
  const { publicPath } = config

  app.use(webpackDevMiddleware(compiler, {
    publicPath, // access by url /publicPath/[name].js
    hot: true,
    lazy: false,
    serverSideRender: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }))
  app.use(webpackHotMiddleware(compiler))
}
