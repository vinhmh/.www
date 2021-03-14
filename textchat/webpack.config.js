import webpack from 'webpack'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import CompressionPlugin from 'compression-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import config, { env } from './config'

const { distPath, srcPath, rootPath, publicPath, webpackMode } = config

const cssLoader = (options) => ({ loader: 'css-loader', options: { url: false, sourceMap: true, ...options } })
const PATHS_TO_TREAT_AS_CSS_MODULES = [
  // 'react-toolbox', // example
  srcPath
]
const cssModulesRegex = new RegExp(`(${PATHS_TO_TREAT_AS_CSS_MODULES.join('|')})`)
const fontOption = 'prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype='

const webpackConfig = {
  entry: {
    app: [srcPath]
  },
  output: {
    path: distPath,
    filename: `[name].[${config.compilerHashType}].js`,
    publicPath,
  },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
      { test: /\.json$/, exclude: ['/node_modules/'], use: [{ loader: 'json-loader' }] },
      // css modules
      { test: /\.scss$/, use: ['style-loader', cssLoader({ modules: true }), 'sass-loader'], include: cssModulesRegex },
      // no css modules
      { test: /\.scss$/, use: ['style-loader', MiniCssExtractPlugin.loader, cssLoader(), 'sass-loader'], exclude: cssModulesRegex },
      { test: /\.css$/, use: ['style-loader', MiniCssExtractPlugin.loader, cssLoader({ url: true })], exclude: cssModulesRegex },
      // File loaders
      { test: /\.woff(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}application/font-woff` }] },
      { test: /\.woff2(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}application/font-woff2` }] },
      { test: /\.otf(\?.*)?$/, use: [{ loader: 'file-loader', options: `${fontOption}font/opentype` }] },
      { test: /\.ttf(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}application/octet-stream` }] },
      { test: /\.eot(\?.*)?$/, use: [{ loader: 'file-loader', options: 'prefix=fonts/&name=[path][name].[ext]' }] },
      { test: /\.svg(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}image/svg+xml` }] },
      { test: /\.(png|jpg)$/, use: [{ loader: 'url-loader', options: 'limit=8192' }] },
      // make jQuery available in browser
      { test: require.resolve('jquery'), use: [{ loader: 'expose-loader', options: '$' }] }
    ]
  },
  resolve: {
    modules: ['node_modules', rootPath]
  },
  mode: webpackMode,
  devtool: config.compilerDevtool,
  plugins: [
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify(config),
      ENV: JSON.stringify(env)
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      React: 'react',
      helpers: ['helpers']
    }),
    new CleanWebpackPlugin([distPath]),
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new HtmlWebpackPlugin({
      template: `${srcPath}/index.html`,
      favicon: `${rootPath}/public/favicon.ico`,
      filename: 'index.html',
      inject: 'body',
    })
  ]
}

if (env.development) {
  webpackConfig.plugins.push(
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  )
  webpackConfig.entry.app.push(
    'webpack-hot-middleware/client',
  )
}
if (env.production) {
  webpackConfig.plugins.push(
    new OptimizeCssAssetsPlugin(),
  )
  webpackConfig.optimization = {
    minimizer: [new TerserPlugin()]
  }
}
export default webpackConfig
