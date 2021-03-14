"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = socket => ({
  id: socket.id,
  user: socket.user.id,
  channels: [...socket.channels]
});

exports.default = _default;