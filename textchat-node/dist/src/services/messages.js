"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteChatSuccess = exports.add = void 0;

var _socket = require("../socket");

var _meeting = _interopRequireDefault(require("../models/meeting"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const add = (message = {}) => {
  if (typeof message.meeting === 'undefined') return;

  _socket.Sender.messagesAdd(message.meeting.channel, message);
};

exports.add = add;

const deleteChatSuccess = ({
  meetingId
}) => {
  const meeting = _meeting.default.find({
    id: meetingId
  });

  _socket.Sender.deleteChatSuccess(meeting.channel, meetingId);
};

exports.deleteChatSuccess = deleteChatSuccess;