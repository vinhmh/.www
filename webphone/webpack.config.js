import webpack from 'webpack'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import CompressionPlugin from 'compression-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import config, { env } from './config'

const { distPath, srcPath, rootPath, sourceMap, publicPath, webpackMode } = config
const localIdentName = env.development ? '[path][name]__[local]' : '[hash:base64]'
const cssLoader = (options) => ({
  loader: 'css-loader',
  options: {
    url: false,
    sourceMap,
    localIdentName,
    ...options
  }
})

const sassLoader = (options) => ({
  loader: 'sass-loader',
  options: {
    sourceMap,
    ...options
  }
})

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
      // css modules
      { test: /\.scss$/, use: ['style-loader', cssLoader({ modules: true }), sassLoader()], include: cssModulesRegex },
      // no css modules
      { test: /\.scss$/, use: ['style-loader', MiniCssExtractPlugin.loader, cssLoader(), sassLoader()], exclude: cssModulesRegex },
      { test: /\.css$/, use: ['style-loader', MiniCssExtractPlugin.loader, cssLoader({ url: true })], exclude: cssModulesRegex },
      // File loaders
      { test: /\.woff(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}application/font-woff` }] },
      { test: /\.woff2(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}application/font-woff2` }] },
      { test: /\.otf(\?.*)?$/, use: [{ loader: 'file-loader', options: `${fontOption}font/opentype` }] },
      { test: /\.ttf(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}application/octet-stream` }] },
      { test: /\.eot(\?.*)?$/, use: [{ loader: 'file-loader', options: 'prefix=fonts/&name=[path][name].[ext]' }] },
      { test: /\.svg(\?.*)?$/, use: [{ loader: 'url-loader', options: `${fontOption}image/svg+xml` }] },
      { test: /\.(png|jpg)$/, use: [{ loader: 'url-loader', options: 'limit=8192' }] },
      { test: /\.mp3$/, use: [{ loader: 'file-loader', options: { emitFile: false, name: '[name].[ext]?[hash:8]' } }] },
      // make jQuery available in browser
      // { test: require.resolve('jquery'), use: [{ loader: 'expose-loader', options: '$' }] }
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
      React: 'react',
      helpers: ['helpers'],
      Logger: ['src/utilities/logger', 'default'],
      TurnStun: ['src/utilities/turn_stun', 'default']
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
