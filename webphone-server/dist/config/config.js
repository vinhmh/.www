"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _dotenv = _interopRequireDefault(require("dotenv"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

_dotenv.default.config();

const config = {
  appUrl: process.env.appUrl,
  webphoneUrl: process.env.webphoneUrl,
  wsUrl: process.env.wsUrl,
  host: process.env.host,
  bbb_secret: process.env.bbb_secret,
  voipHost: process.env.voipHost,
  outputPath: process.env.outputPath,
  compilerHashType: process.env.compilerHashType,
  compilerDevtool: process.env.compilerDevtool,
  webpackMode: process.env.webpackMode,
  minimizeAssets: process.env.minimizeAssets,
  publicPath: process.env.publicPath,
  manifestFilename: process.env.manifestFilename,
  secretToken: process.env.secretToken,
  webphoneCheckUrl: process.env.webphoneCheckUrl,
  browserMinimalVersion: {
    Chrome: 80,
    Safari: 13,
    Firefox: 78,
    Edge: 80
  },
  systemMinimalVersion: {
    MacOS: 10.13,
    iOS: 13.0,
    Android: 9,
    Windows: 7
  },
  terms: {
    regularTerms: 'https://en.ibridgepeople.com/utilisation',
    interpreterTerms: 'https://en.ibridgepeople.com/utilisation',
    moderatorTerms: 'https://en.ibridgepeople.com/utilisation'
  }
};

const _default = _objectSpread(_objectSpread({}, config), process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ? {
  compilerHashType: 'chunkhash',
  compilerDevtool: false,
  webpackMode: 'production',
  minimizeAssets: true
} : {});

var _default2 = _default;
exports.default = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(config, "config", "/home/vinhmh/Project/dev/.www/webphone-server/config/config.js");
  reactHotLoader.register(_default, "default", "/home/vinhmh/Project/dev/.www/webphone-server/config/config.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();