"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _config = require("../config");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const router = _express.default.Router();

router.get('/', (req, res) => res.render('admin/admin', {
  title: 'Admin'
}));
router.get('/monitor', (req, res) => res.render('admin/monitor'));
router.get('/switcher', (req, res) => res.render('admin/switcher'));
router.get('/confMap', (req, res) => res.send(_config.confMap));
const _default = router;
var _default2 = _default;
exports.default = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/vinhmh/Project/dev/.www/webphone-server/routes/admin.js");
  reactHotLoader.register(_default, "default", "/home/vinhmh/Project/dev/.www/webphone-server/routes/admin.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();