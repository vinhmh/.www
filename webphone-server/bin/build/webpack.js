import fs from 'fs-extra'
import webpack from 'webpack'
import config from '../../config'
import webpackConfig from '../../webpack.config'

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
    } else if (jsonStats.errors.length > 0) {
      console.log('Webpack compiler encountered errors.')
      console.log(jsonStats.errors.join('\n'))
      return reject(new Error('Webpack compiler encountered errors'))
    } else if (jsonStats.warnings.length > 0) {
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
    const assets = stats.assetsByChunkName
    const { manifestFilename, rootPath, outputPath } = config
    // Create webpack manifest file
    const manifetPath = `${rootPath}/${outputPath}/${manifestFilename}`
    fs.writeJson(manifetPath, assets, err => {
      if (err) throw err
      console.log('Webpack manifest created!')
    })
  } catch (e) {
    console.log('Compiler encountered an error.', e)
    process.exit(1)
  }
}())
