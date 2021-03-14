"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "app", {
  enumerable: true,
  get: function get() {
    return _app.default;
  }
});
Object.defineProperty(exports, "bbb", {
  enumerable: true,
  get: function get() {
    return _bbb.default;
  }
});
Object.defineProperty(exports, "admin", {
  enumerable: true,
  get: function get() {
    return _admin.default;
  }
});

var _app = _interopRequireDefault(require("./app"));

var _bbb = _interopRequireDefault(require("./bbb"));

var _admin = _interopRequireDefault(require("./admin"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};