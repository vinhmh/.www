"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleSpeak = void 0;

var _socket = require("../socket");

const toggleSpeak = (member, user) => {
  if (member.user.id === user.id) return;
  const action = member.speak ? 'has unmuted' : 'has muted';

  _socket.Sender.notify(member.user.channels.self, `${user.displayName} ${action} you`);
};

exports.toggleSpeak = toggleSpeak;