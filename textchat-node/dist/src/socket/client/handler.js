"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ = _interopRequireDefault(require("."));

var _user = _interopRequireDefault(require("../../models/user"));

var _message = _interopRequireDefault(require("../../models/message"));

var _meeting = _interopRequireDefault(require("../../models/meeting"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (event, client, data) => {
  try {
    switch (event) {
      case _.default.NEW_USER:
        _user.default.add(client, data);

        break;

      case _.default.NEW_MEETING:
        _meeting.default.addNew(client, data);

        break;

      case _.default.MESSAGE_SEND:
        _message.default.add(client, data);

        break;

      case _.default.REMOVE_USER:
        _meeting.default.removeUser(client, data);

        break;

      case _.default.DELETE_CHAT:
        _message.default.removeMessagesByMeeting(data);

        break;

      default:
        console.log('Socket, no such event: ', event);
    }
  } catch (e) {
    console.log('Error:', e);
  }
};

exports.default = _default;