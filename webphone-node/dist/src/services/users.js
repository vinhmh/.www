"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _adjustments = _interopRequireDefault(require("../libs/adjustments"));

var _user = _interopRequireDefault(require("../models/user"));

var _member = _interopRequireDefault(require("../models/member"));

var _socket = require("../socket");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// TODO get rid of class
class UsersService {}

exports.default = UsersService;

_defineProperty(UsersService, "add", user => {
  _socket.Sender.newUser(user.channels.self, user);

  _socket.Sender.changeMembers(user.channels.self, _member.default.byRoom(...user.channels.rooms));

  _socket.Sender.adjustments(user.channels.self, _adjustments.default);
});

_defineProperty(UsersService, "update", user => {
  UsersService.updateProfile(user);
  user.members.forEach(member => {
    _socket.Sender.updateMember(member.roomId, member);
  });
});

_defineProperty(UsersService, "updateProfile", user => {
  _socket.Sender.updateProfile(user.channels.self, user);
});

_defineProperty(UsersService, "relayUser", ({
  userId,
  msg
}) => {
  const user = _user.default.find(userId);

  _member.default.all.forEach(m => {
    if (m.user.id == userId) {
      m.moderatorStatus = msg;
    }
  });

  const {
    first,
    second
  } = user.rooms;

  const list = _user.default.all.filter(u => u.id !== user.id && [u.rooms.first, u.rooms.second].sort().join() === [first, second].sort().join());

  list.forEach(u => {
    _socket.Sender.makeRelay(u.channels.self);

    _socket.Sender.notify(u.channels.self, {
      msg,
      userId
    });
  });
});