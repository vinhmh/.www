"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = _interopRequireDefault(require("../socket"));

var _freeswitch = _interopRequireDefault(require("../../services/freeswitch"));

var _adjustments = _interopRequireDefault(require("../../libs/adjustments"));

var _user = _interopRequireDefault(require("../../models/user"));

var _client = _interopRequireWildcard(require("../client"));

var _users = _interopRequireDefault(require("../../services/users"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (event, client, data) => {
  try {
    switch (event) {
      // TODO: Add admin namespace to events
      case _socket.default.TOGGLE_SPEAK_SELF:
        _freeswitch.default.toggleSpeakSelf(data);

        break;

      case _socket.default.TOGGLE_HEAR_SELF:
        _freeswitch.default.toggleHearSelf(data);

        break;

      case _socket.default.TOGGLE_ADJUSTMENTS:
        _adjustments.default.toggle(typeof data == 'string' ? data : data.name);

        break;

      case _socket.default.TOGGLE_MEETING_ADJUSTMENTS:
        _adjustments.default.toggleMeeting(data.name, data.meetingId);

        break;

      case _socket.default.USER_PEEK_ON:
        _freeswitch.default.peekOn(data);

        break;

      case _socket.default.USER_PEEK_OFF:
        _freeswitch.default.peekOff(data);

        break;

      case _socket.default.ADMIN_DISCONNECT_USER:
        {
          const socket = _client.default.byUser(data.userId);

          socket.send({
            event: _socket.default.DISABLE_RECONNECT
          });
          socket.close();
          break;
        }

      case _socket.default.ADMIN_RECONNECT_USER:
        {
          const socket = _client.default.byUser(data.userId);

          socket.send({
            event: _socket.default.RECONNECT_USER
          });
          socket.close();
          break;
        }

      case _socket.default.ADMIN_GET_USER_STATE:
        {
          const user = _user.default.find(data);

          const {
            userState
          } = user;
          client.send({
            event: _socket.default.ADMIN_SET_USER_STATE,
            data: {
              userId: user.id,
              userState
            }
          });
          break;
        }

      case _socket.default.ADMIN_NOTIFY_USER:
        {
          const user = _user.default.find(data.userId);

          _client.Sender.notify(user.channels.self, data.message);

          break;
        }

      case _socket.default.SWITCH_ROOMS:
        {
          _freeswitch.default.switchRooms(data);

          const user = _user.default.find(data.userId);

          _users.default.update(user);

          break;
        }

      default:
        console.log('Socket, no such event: ', event);
    }
  } catch (e) {
    console.error(`Error: ${e}`);
  }
};

exports.default = _default;