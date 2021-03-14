"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "confMap", {
  enumerable: true,
  get: function get() {
    return _conf_map.default;
  }
});
Object.defineProperty(exports, "app", {
  enumerable: true,
  get: function get() {
    return _express.default;
  }
});
exports.default = exports.env = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var path = _interopRequireWildcard(require("path"));

var _conf_map = _interopRequireDefault(require("../shared/conf_map"));

var _express = _interopRequireDefault(require("./express"));

var _config = _interopRequireDefault(require("./config"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const rootPath = path.join(__dirname, '..');
const settingsPath = `${rootPath}/config/settings.yml`;
const nodeEnv = process.env.NODE_ENV || 'development';
const configMode = process.env.CONFIG_MODE;
_config.default.rootPath = rootPath;
global.rootPath = rootPath;
const env = {
  [nodeEnv]: true
};
exports.env = env;
const _default = _config.default;
var _default2 = _default;
exports.default = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(rootPath, "rootPath", "/home/vinhmh/Project/dev/.www/webphone-server/config/index.js");
  reactHotLoader.register(settingsPath, "settingsPath", "/home/vinhmh/Project/dev/.www/webphone-server/config/index.js");
  reactHotLoader.register(nodeEnv, "nodeEnv", "/home/vinhmh/Project/dev/.www/webphone-server/config/index.js");
  reactHotLoader.register(configMode, "configMode", "/home/vinhmh/Project/dev/.www/webphone-server/config/index.js");
  reactHotLoader.register(env, "env", "/home/vinhmh/Project/dev/.www/webphone-server/config/index.js");
  reactHotLoader.register(_default, "default", "/home/vinhmh/Project/dev/.www/webphone-server/config/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();