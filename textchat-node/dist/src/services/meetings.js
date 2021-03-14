"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeUser = exports.messagesChangeToNewUser = exports.add = void 0;

var _socket = require("../socket");

var _user = _interopRequireDefault(require("../models/user"));

var _message = _interopRequireDefault(require("../models/message"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const add = meeting => {
  _socket.Sender.meetingsAdd(meeting.channel, meeting);
};

exports.add = add;

const messagesChangeToNewUser = (meeting, newUsers) => {
  const messages = _message.default.byMeeting(meeting);

  for (const userId of newUsers) {
    const user = _user.default.find({
      id: userId
    });

    if (!user) return;

    _socket.Sender.messagesUpdateUser(meeting.channel, user);

    _socket.Sender.messagesChange(user.channel, messages);
  }
};

exports.messagesChangeToNewUser = messagesChangeToNewUser;

const removeUser = (meeting, user) => {
  _socket.Sender.removeUser(meeting.channel, {
    meeting,
    user
  });
};

exports.removeUser = removeUser;