"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = require("../socket");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// TODO get rid of class
class MembersService {}

exports.default = MembersService;

_defineProperty(MembersService, "addMember", member => {
  _socket.Sender.addMember(member.roomId, member);

  _socket.Sender.updateProfile(member.user.channels.self, member.user);
});

_defineProperty(MembersService, "delMember", member => {
  _socket.Sender.delMember(member.roomId, member);

  _socket.Sender.updateProfile(member.user.channels.self, member.user);
});

_defineProperty(MembersService, "updateMember", member => {
  if (!member.persisted) return;

  _socket.Sender.updateMember(member.roomId, member);

  _socket.Sender.updateProfile(member.user.channels.self, member.user);
});