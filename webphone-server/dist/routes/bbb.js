"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _querystring = _interopRequireDefault(require("querystring"));

var _bbb = require("../services/bbb");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const router = _express.default.Router();

const makeRequest = (request, res, next) => request().then(response => {
  res.send(response.data);
}).catch(error => {
  console.log(error);
  next();
});

router.use('/getMeetings', (req, res, next) => {
  const send = () => (0, _bbb.getMeetings)();

  return makeRequest(send, res, next);
});
router.use('/create', (req, res, next) => {
  const query = _querystring.default.stringify(req.query);

  const send = () => (0, _bbb.createMeeting)(query);

  return makeRequest(send, res, next);
});
router.use('/end', (req, res, next) => {
  const query = _querystring.default.stringify(req.query);

  const send = () => (0, _bbb.endMeeting)(query);

  return makeRequest(send, res, next);
});
router.use('/join', (req, res, next) => {
  const query = _querystring.default.stringify(req.query);

  return res.send((0, _bbb.joinMeetingUrl)(query));
});
const _default = router;
var _default2 = _default;
exports.default = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/vinhmh/Project/dev/.www/webphone-server/routes/bbb.js");
  reactHotLoader.register(makeRequest, "makeRequest", "/home/vinhmh/Project/dev/.www/webphone-server/routes/bbb.js");
  reactHotLoader.register(_default, "default", "/home/vinhmh/Project/dev/.www/webphone-server/routes/bbb.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();