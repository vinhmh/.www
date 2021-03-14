"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = (user, options = {}) => {
  const result = {
    id: user.id,
    active: user.active,
    username: user.username,
    meeting: user.meeting,
    department: user.department
  };
  return result;
};

exports.default = _default;