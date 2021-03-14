"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _webpack = _interopRequireDefault(require("webpack"));

var _webpackDevMiddleware = _interopRequireDefault(require("webpack-dev-middleware"));

var _webpackHotMiddleware = _interopRequireDefault(require("webpack-hot-middleware"));

var _ = _interopRequireWildcard(require(".."));

var _webpack2 = _interopRequireDefault(require("../../webpack.config"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

if (_.env.development) {
  const compiler = (0, _webpack.default)(_webpack2.default);
  const {
    publicPath
  } = _.default;

  _.app.use((0, _webpackDevMiddleware.default)(compiler, {
    publicPath,
    // access by url /publicPath/[name].js
    hot: true,
    lazy: false,
    serverSideRender: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }));

  _.app.use((0, _webpackHotMiddleware.default)(compiler));
}