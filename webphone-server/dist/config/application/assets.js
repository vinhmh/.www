"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _ = _interopRequireWildcard(require(".."));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const {
  manifestFilename,
  outputPath,
  rootPath
} = _.default;

_.app.use((req, res, next) => {
  let assets = [];

  if (res.locals.webpackStats) {
    assets = res.locals.webpackStats.toJson().assetsByChunkName;
  } else {
    assets = _fsExtra.default.readJsonSync(`${rootPath}/${outputPath}/${manifestFilename}`);
  }

  res.locals.assets = assets;
  next();
});

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(manifestFilename, "manifestFilename", "/home/vinhmh/Project/dev/.www/webphone-server/config/application/assets.js");
  reactHotLoader.register(outputPath, "outputPath", "/home/vinhmh/Project/dev/.www/webphone-server/config/application/assets.js");
  reactHotLoader.register(rootPath, "rootPath", "/home/vinhmh/Project/dev/.www/webphone-server/config/application/assets.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();