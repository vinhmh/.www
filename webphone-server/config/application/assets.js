import fs from 'fs-extra'
import config, { app } from '..'

const { manifestFilename, outputPath, rootPath } = config

app.use((req, res, next) => {
  let assets = []
  if (res.locals.webpackStats) {
    assets = res.locals.webpackStats.toJson().assetsByChunkName
  } else {
    assets = fs.readJsonSync(`${rootPath}/${outputPath}/${manifestFilename}`)
  }
  res.locals.assets = assets
  next()
})
