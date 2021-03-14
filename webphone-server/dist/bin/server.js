"use strict";

require("../config/application");

var _config = require("../config");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

_config.app.listen(3001, () => console.log('Webphone server is listening port 3001!'));