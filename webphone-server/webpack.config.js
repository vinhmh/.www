import webpack from 'webpack'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import CompressionPlugin from 'compression-webpack-plugin'
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import config, { env, confMap } from './config'

const { outputPath, rootPath } = config
const srcPath = `${config.rootPath}/src`

const PATHS_TO_TREAT_AS_CSS_MODULES = [
  // 'react-toolbox', (example)
  `${srcPath}/javascripts`.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&')
]

const cssLoader = { loader: 'css-loader', options: { modules: true } }
const cssModulesRegex = new RegExp(`(${PATHS_TO_TREAT_AS_CSS_MODULES.join('|')})`)
const fontOption = 'prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype='

const webpackConfig = {
  entry: {
    app: [`${srcPath}/javascripts/app`],
    admin: [`${srcPath}/javascripts/admin`],
  },
  output: {
    path: `${rootPath}/${outputPath}`,
    filename: `[name].[${config.compilerHashType}].js`,
    publicPath: config.publicPath,
  },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
      { test: /\.pug/, use: [{ loader: 'pug-loader', options: { pretty: true } }] },
      // css modules
      { test: /\.scss$/, use: ['style-loader', cssLoader, 'sass-loader'], include: cssModulesRegex },
      // no css modules
      { test: /\.scss$/, use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'], exclude: cssModulesRegex },
      { test: /\.css$/, use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader'], exclude: cssModulesRegex },
      // File loaders
      { test: /\.woff(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}application/font-woff` }] },
      { test: /\.woff2(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}application/font-woff2` }] },
      { test: /\.otf(\?.*)?$/, use: [{ loader: 'file-loader', options: `${fontOption}font/opentype` }] },
      { test: /\.ttf(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}application/octet-stream` }] },
      { test: /\.eot(\?.*)?$/, use: [{ loader: 'file-loader', options: 'prefix=fonts/&name=[path][name].[ext]' }] },
      { test: /\.svg(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}image/svg+xml` }] },
      { test: /\.(png|jpg)$/, use: [{ loader: 'url-loader', options: 'limit=8192' }] },
      { test: /\.mp3$/, use: [{ loader: 'file-loader', options: { name: 'static/media/[name].[hash:8].[ext]' } }] },
      { test: /\.yml$/, use: [{ loader: 'file-loader', options: { name: 'static/media/[name].[hash:8].[ext]' } }] },
      // make jQuery available in browser
      { test: require.resolve('jquery'), use: [{ loader: 'expose-loader', options: '$' }] }
    ]
  },
  resolve: {
    modules: ['node_modules', rootPath],
  },
  mode: config.webpackMode,
  devtool: config.compilerDevtool,
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      React: 'react',
      deepCopy: ['helpers', 'deepCopy']
    }),
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify(config),
      CONF_MAP: JSON.stringify(confMap),
      ENV: JSON.stringify(env),
    }),
    new CleanWebpackPlugin([`${rootPath}/${outputPath}`]),
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
    // new BundleAnalyzerPlugin(),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
}

if (env.development) {
  webpackConfig.plugins.push(
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
  webpackConfig.entry.admin.push(
    'webpack-hot-middleware/client'
  )
}

if (config.minimizeAssets) {
  webpackConfig.plugins.push(
    new OptimizeCssAssetsPlugin(),
  )
  webpackConfig.optimization = {
    minimizer: [new UglifyJsPlugin()]
  }
}

export default webpackConfig
