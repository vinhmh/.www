"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.joinMeetingUrl = exports.endMeeting = exports.createMeeting = exports.getMeetingInfo = exports.getMeetings = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _sha = _interopRequireDefault(require("sha1"));

var _config = _interopRequireDefault(require("../config"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {
  return a;
};

const {
  bbb_secret,
  host
} = _config.default;

const getMeetings = () => {
  const checksum = (0, _sha.default)('getMeetings' + bbb_secret);
  return _axios.default.get(host + '/getMeetings?checksum=' + checksum);
};

exports.getMeetings = getMeetings;

const getMeetingInfo = query => {
  const checksum = (0, _sha.default)('getMeetingInfo' + query + bbb_secret);
  return _axios.default.get(host + '/getMeetingInfo?' + query + '&checksum=' + checksum);
};

exports.getMeetingInfo = getMeetingInfo;

const createMeeting = query => {
  const checksum = (0, _sha.default)('create' + query + bbb_secret);
  return _axios.default.get(host + '/create?' + query + '&checksum=' + checksum);
};

exports.createMeeting = createMeeting;

const endMeeting = query => {
  const checksum = (0, _sha.default)('end' + query + bbb_secret);
  return _axios.default.get(host + '/end?' + query + '&checksum=' + checksum);
};

exports.endMeeting = endMeeting;

const joinMeetingUrl = query => {
  const checksum = (0, _sha.default)('join' + query + bbb_secret);
  return host + '/join?' + query + '&checksum=' + checksum;
};

exports.joinMeetingUrl = joinMeetingUrl;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(bbb_secret, "bbb_secret", "/home/vinhmh/Project/dev/.www/webphone-server/services/bbb.js");
  reactHotLoader.register(host, "host", "/home/vinhmh/Project/dev/.www/webphone-server/services/bbb.js");
  reactHotLoader.register(getMeetings, "getMeetings", "/home/vinhmh/Project/dev/.www/webphone-server/services/bbb.js");
  reactHotLoader.register(getMeetingInfo, "getMeetingInfo", "/home/vinhmh/Project/dev/.www/webphone-server/services/bbb.js");
  reactHotLoader.register(createMeeting, "createMeeting", "/home/vinhmh/Project/dev/.www/webphone-server/services/bbb.js");
  reactHotLoader.register(endMeeting, "endMeeting", "/home/vinhmh/Project/dev/.www/webphone-server/services/bbb.js");
  reactHotLoader.register(joinMeetingUrl, "joinMeetingUrl", "/home/vinhmh/Project/dev/.www/webphone-server/services/bbb.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();