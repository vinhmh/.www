"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "MeetingSerializer", {
  enumerable: true,
  get: function () {
    return _meeting.default;
  }
});
Object.defineProperty(exports, "MessageSerializer", {
  enumerable: true,
  get: function () {
    return _message.default;
  }
});
Object.defineProperty(exports, "UserSerializer", {
  enumerable: true,
  get: function () {
    return _user.default;
  }
});

var _meeting = _interopRequireDefault(require("./meeting"));

var _message = _interopRequireDefault(require("./message"));

var _user = _interopRequireDefault(require("./user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }