"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _httpAuth = _interopRequireDefault(require("http-auth"));

var Routes = _interopRequireWildcard(require("../../routes"));

var _ = require("..");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const basic = _httpAuth.default.basic({
  realm: 'SUPER SECRET STUFF'
}, (username, password, callback) => callback(username === 'admin' && password === 'webphone'));

const authMiddleware = _httpAuth.default.connect(basic);

_.app.use('/', Routes.app);

_.app.use('/admin', authMiddleware, Routes.admin);

_.app.use('/bbb', Routes.bbb);

if (_.env.development) {
  _.app.use(_express.default.static(`${rootPath}/public`));
} // catch 404 and forward to error handler


_.app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
}); // error handler


_.app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = err;
  res.status(err.status || 500);
  res.render('shared/error');
});

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(basic, "basic", "/home/vinhmh/Project/dev/.www/webphone-server/config/application/routes.js");
  reactHotLoader.register(authMiddleware, "authMiddleware", "/home/vinhmh/Project/dev/.www/webphone-server/config/application/routes.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();