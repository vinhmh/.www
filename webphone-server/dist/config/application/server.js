"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _morgan = _interopRequireDefault(require("morgan"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _ = _interopRequireWildcard(require(".."));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

_.app.set('views', `${rootPath}/views`);

_.app.set('view engine', 'pug');

_.app.set('config', _.default);

_.app.use((req, res, next) => {
  res.locals.config = _.default;
  res.locals.env = _.env;
  next();
});

_.app.use((0, _morgan.default)('dev'));

_.app.use(_bodyParser.default.json());

_.app.use(_bodyParser.default.urlencoded({
  extended: false
}));

_.app.use((0, _cookieParser.default)());