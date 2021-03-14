"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disable = exports.load = void 0;

var _message = _interopRequireDefault(require("../models/message"));

var _socket = require("../socket");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const load = (user, deeplLangsSupport) => {
  const {
    meeting
  } = user;

  const messages = _message.default.byMeeting(meeting);

  _socket.Sender.userChange(user.channel, user);

  _socket.Sender.messagesUpdateUser(meeting.channel, user);

  _socket.Sender.messagesChange(user.channel, messages);

  _socket.Sender.appLoaded(user.channel, deeplLangsSupport);
};

exports.load = load;

const disable = (user, channel) => {
  _socket.Sender.messagesUpdateUser(channel, user);
};

exports.disable = disable;