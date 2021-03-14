import webpack from 'webpack'
import webpackConfig from '../webpack.config'

const DEFAULT_STATS_FORMAT = { colors: true }

const webpackCompiler = (webpackConfig, statsFormat = DEFAULT_STATS_FORMAT) => new Promise((resolve, reject) => {
  const compiler = webpack(webpackConfig)

  compiler.run((err, stats) => {
    const jsonStats = stats.toJson()
    console.log('Webpack compile completed.')
    console.log(stats.toString(statsFormat))
    if (err) {
      console.log('Webpack compiler encountered a fatal error.', err)
      return reject(err)
    }
    if (jsonStats.errors.length > 0) {
      console.log('Webpack compiler encountered errors.')
      console.log(jsonStats.errors.join('\n'))
      return reject(new Error('Webpack compiler encountered errors'))
    }
    if (jsonStats.warnings.length > 0) {
      console.log('Webpack compiler encountered warnings.')
      console.log(jsonStats.warnings.join('\n'))
    } else {
      console.log('No errors or warnings encountered.')
    }
    resolve(jsonStats)
  })
});

(async function () {
  try {
    console.log('Run compiler')
    const stats = await webpackCompiler(webpackConfig)
  } catch (e) {
    console.log('Compiler encountered an error.', e)
    process.exit(1)
  }
}())
