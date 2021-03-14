"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = (message, options = {}) => {
  const result = {
    id: message.id,
    lang: message.lang,
    user: message.user,
    meeting: message.meeting,
    text: message.text,
    file: message.file,
    createdAt: message.createdAt
  };
  return result;
};

exports.default = _default;