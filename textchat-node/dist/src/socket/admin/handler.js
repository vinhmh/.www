"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = _interopRequireDefault(require("../socket"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (event, client, data) => {
  try {
    switch (event) {
      // case Socket.TOGGLE_SPEAK_SELF:
      //   Freeswitch.toggleSpeakSelf(data)
      //   break
      default:
        console.log('Socket, no such event: ', event);
    }
  } catch (e) {
    console.log('Error:', e);
  }
};

exports.default = _default;