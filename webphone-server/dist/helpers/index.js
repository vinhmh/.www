"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepCopy = void 0;

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const deepCopy = o => {
  let i;
  let newO;
  if (typeof o !== 'object') return o;
  if (!o) return o;

  if (Object.prototype.toString.apply(o) === '[object Array]') {
    newO = [];

    for (i = 0; i < o.length; i += 1) {
      newO[i] = deepCopy(o[i]);
    }

    return newO;
  }

  newO = {};

  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = deepCopy(o[i]);
    }
  }

  return newO;
};

exports.deepCopy = deepCopy;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(deepCopy, "deepCopy", "/home/vinhmh/Project/dev/.www/webphone-server/helpers/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();