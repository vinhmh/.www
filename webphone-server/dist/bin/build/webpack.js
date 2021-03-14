"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _webpack = _interopRequireDefault(require("webpack"));

var _config = _interopRequireDefault(require("../../config"));

var _webpack2 = _interopRequireDefault(require("../../webpack.config"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const DEFAULT_STATS_FORMAT = {
  colors: true
};

const webpackCompiler = function webpackCompiler(webpackConfig) {
  let statsFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_STATS_FORMAT;
  return new Promise((resolve, reject) => {
    const compiler = (0, _webpack.default)(webpackConfig);
    compiler.run((err, stats) => {
      const jsonStats = stats.toJson();
      console.log('Webpack compile completed.');
      console.log(stats.toString(statsFormat));

      if (err) {
        console.log('Webpack compiler encountered a fatal error.', err);
        return reject(err);
      } else if (jsonStats.errors.length > 0) {
        console.log('Webpack compiler encountered errors.');
        console.log(jsonStats.errors.join('\n'));
        return reject(new Error('Webpack compiler encountered errors'));
      } else if (jsonStats.warnings.length > 0) {
        console.log('Webpack compiler encountered warnings.');
        console.log(jsonStats.warnings.join('\n'));
      } else {
        console.log('No errors or warnings encountered.');
      }

      resolve(jsonStats);
    });
  });
};

(async function () {
  try {
    console.log('Run compiler');
    const stats = await webpackCompiler(_webpack2.default);
    const assets = stats.assetsByChunkName;
    const {
      manifestFilename,
      rootPath,
      outputPath
    } = _config.default; // Create webpack manifest file

    const manifetPath = `${rootPath}/${outputPath}/${manifestFilename}`;

    _fsExtra.default.writeJson(manifetPath, assets, err => {
      if (err) throw err;
      console.log('Webpack manifest created!');
    });
  } catch (e) {
    console.log('Compiler encountered an error.', e);
    process.exit(1);
  }
})();

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(DEFAULT_STATS_FORMAT, "DEFAULT_STATS_FORMAT", "/home/vinhmh/Project/dev/.www/webphone-server/bin/build/webpack.js");
  reactHotLoader.register(webpackCompiler, "webpackCompiler", "/home/vinhmh/Project/dev/.www/webphone-server/bin/build/webpack.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();