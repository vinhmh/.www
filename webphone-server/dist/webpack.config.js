"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webpack = _interopRequireDefault(require("webpack"));

var _cleanWebpackPlugin = _interopRequireDefault(require("clean-webpack-plugin"));

var _miniCssExtractPlugin = _interopRequireDefault(require("mini-css-extract-plugin"));

var _uglifyjsWebpackPlugin = _interopRequireDefault(require("uglifyjs-webpack-plugin"));

var _optimizeCssAssetsWebpackPlugin = _interopRequireDefault(require("optimize-css-assets-webpack-plugin"));

var _compressionWebpackPlugin = _interopRequireDefault(require("compression-webpack-plugin"));

var _config = _interopRequireWildcard(require("./config"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const {
  outputPath,
  rootPath
} = _config.default;
const srcPath = `${_config.default.rootPath}/src`;
const PATHS_TO_TREAT_AS_CSS_MODULES = [// 'react-toolbox', (example)
`${srcPath}/javascripts`.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&')];
const cssLoader = {
  loader: 'css-loader',
  options: {
    modules: true
  }
};
const cssModulesRegex = new RegExp(`(${PATHS_TO_TREAT_AS_CSS_MODULES.join('|')})`);
const fontOption = 'prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=';
const webpackConfig = {
  entry: {
    app: [`${srcPath}/javascripts/app`],
    admin: [`${srcPath}/javascripts/admin`]
  },
  output: {
    path: `${rootPath}/${outputPath}`,
    filename: `[name].[${_config.default.compilerHashType}].js`,
    publicPath: _config.default.publicPath
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }, {
      test: /\.pug/,
      use: [{
        loader: 'pug-loader',
        options: {
          pretty: true
        }
      }]
    }, // css modules
    {
      test: /\.scss$/,
      use: ['style-loader', cssLoader, 'sass-loader'],
      include: cssModulesRegex
    }, // no css modules
    {
      test: /\.scss$/,
      use: ['style-loader', _miniCssExtractPlugin.default.loader, 'css-loader', 'sass-loader'],
      exclude: cssModulesRegex
    }, {
      test: /\.css$/,
      use: ['style-loader', _miniCssExtractPlugin.default.loader, 'css-loader'],
      exclude: cssModulesRegex
    }, // File loaders
    {
      test: /\.woff(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: `${fontOption}application/font-woff`
      }]
    }, {
      test: /\.woff2(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: `${fontOption}application/font-woff2`
      }]
    }, {
      test: /\.otf(\?.*)?$/,
      use: [{
        loader: 'file-loader',
        options: `${fontOption}font/opentype`
      }]
    }, {
      test: /\.ttf(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: `${fontOption}application/octet-stream`
      }]
    }, {
      test: /\.eot(\?.*)?$/,
      use: [{
        loader: 'file-loader',
        options: 'prefix=fonts/&name=[path][name].[ext]'
      }]
    }, {
      test: /\.svg(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: `${fontOption}image/svg+xml`
      }]
    }, {
      test: /\.(png|jpg)$/,
      use: [{
        loader: 'url-loader',
        options: 'limit=8192'
      }]
    }, {
      test: /\.mp3$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }]
    }, {
      test: /\.yml$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }]
    }, // make jQuery available in browser
    {
      test: require.resolve('jquery'),
      use: [{
        loader: 'expose-loader',
        options: '$'
      }]
    }]
  },
  resolve: {
    modules: ['node_modules', rootPath]
  },
  mode: _config.default.webpackMode,
  devtool: _config.default.compilerDevtool,
  plugins: [new _webpack.default.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    React: 'react',
    deepCopy: ['helpers', 'deepCopy']
  }), new _webpack.default.DefinePlugin({
    CONFIG: JSON.stringify(_config.default),
    CONF_MAP: JSON.stringify(_config.confMap),
    ENV: JSON.stringify(_config.env)
  }), new _cleanWebpackPlugin.default([`${rootPath}/${outputPath}`]), new _miniCssExtractPlugin.default({
    filename: '[name].[contenthash].css'
  }), // new BundleAnalyzerPlugin(),
  new _compressionWebpackPlugin.default({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.js$|\.css$|\.html$/,
    threshold: 10240,
    minRatio: 0.8
  })]
};

if (_config.env.development) {
  webpackConfig.plugins.push(new _webpack.default.NamedModulesPlugin(), new _webpack.default.HotModuleReplacementPlugin(), new _webpack.default.NoEmitOnErrorsPlugin());
  webpackConfig.entry.admin.push('webpack-hot-middleware/client');
}

if (_config.default.minimizeAssets) {
  webpackConfig.plugins.push(new _optimizeCssAssetsWebpackPlugin.default());
  webpackConfig.optimization = {
    minimizer: [new _uglifyjsWebpackPlugin.default()]
  };
}

const _default = webpackConfig;
var _default2 = _default;
exports.default = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(outputPath, "outputPath", "/home/vinhmh/Project/dev/.www/webphone-server/webpack.config.js");
  reactHotLoader.register(rootPath, "rootPath", "/home/vinhmh/Project/dev/.www/webphone-server/webpack.config.js");
  reactHotLoader.register(srcPath, "srcPath", "/home/vinhmh/Project/dev/.www/webphone-server/webpack.config.js");
  reactHotLoader.register(PATHS_TO_TREAT_AS_CSS_MODULES, "PATHS_TO_TREAT_AS_CSS_MODULES", "/home/vinhmh/Project/dev/.www/webphone-server/webpack.config.js");
  reactHotLoader.register(cssLoader, "cssLoader", "/home/vinhmh/Project/dev/.www/webphone-server/webpack.config.js");
  reactHotLoader.register(cssModulesRegex, "cssModulesRegex", "/home/vinhmh/Project/dev/.www/webphone-server/webpack.config.js");
  reactHotLoader.register(fontOption, "fontOption", "/home/vinhmh/Project/dev/.www/webphone-server/webpack.config.js");
  reactHotLoader.register(webpackConfig, "webpackConfig", "/home/vinhmh/Project/dev/.www/webphone-server/webpack.config.js");
  reactHotLoader.register(_default, "default", "/home/vinhmh/Project/dev/.www/webphone-server/webpack.config.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();