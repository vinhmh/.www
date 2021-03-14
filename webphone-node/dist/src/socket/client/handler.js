"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ = _interopRequireDefault(require("."));

var _user = _interopRequireDefault(require("../../models/user"));

var _users = _interopRequireDefault(require("../../services/users"));

var _freeswitch = _interopRequireDefault(require("../../services/freeswitch"));

var _esl = _interopRequireDefault(require("../../esl"));

var Sender = _interopRequireWildcard(require("../admin/sender"));

var _member = _interopRequireDefault(require("../../models/member"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (event, client, data) => {
  // TODO add pundut style authorization
  try {
    switch (event) {
      case _.default.NEW_USER:
        _user.default.add(client, data);

        break;

      case _.default.MUTE_SPEAK:
        {
          const {
            memberId,
            roomId
          } = data;

          _esl.default.muteSpeak(memberId, roomId);

          break;
        }

      case _.default.UNMUTE_SPEAK:
        {
          const {
            memberId,
            roomId
          } = data;

          _esl.default.unmuteSpeak(memberId, roomId);

          break;
        }

      case _.default.MUTE_HEAR:
        {
          const {
            memberId,
            roomId
          } = data;

          _esl.default.muteHear(memberId, roomId);

          break;
        }

      case _.default.UNMUTE_HEAR:
        {
          const {
            memberId,
            roomId
          } = data;

          _esl.default.unmuteHear(memberId, roomId);

          break;
        }

      case _.default.TOGGLE_SPEAK_SELF:
        _freeswitch.default.toggleSpeakSelf(data);

        break;

      case _.default.TOGGLE_HEAR_SELF:
        _freeswitch.default.toggleHearSelf(data);

        break;

      case _.default.TOGGLE_SPEAK_MEMBER:
        _freeswitch.default.toggleSpeakMember(data);

        break;

      case _.default.TOGGLE_HEAR_MEMBER:
        _freeswitch.default.toggleHearMember(data);

        break;

      case _.default.CHANGE_CURRENT_ROOM:
        _freeswitch.default.changeRegularRoom(data);

        break;

      case _.default.SWITCH_ROOMS:
        _freeswitch.default.switchRooms(data);

        break;

      case _.default.JOIN_LOUNGE:
        _freeswitch.default.joinLounge(data);

        break;

      case _.default.LEAVE_LOUNGE:
        _freeswitch.default.leaveLounge(data);

        break;

      case _.default.PICK_RELAY:
        _freeswitch.default.pickRelay(data);

        break;

      case _.default.PICK_FLOOR:
        _freeswitch.default.pickFloor(data);

        break;

      case _.default.PICK_LANGB:
        _freeswitch.default.pickLangb(data);

        break;

      case _.default.PICK_ORATOR:
        _freeswitch.default.pickOrator(data);

        break;

      case _.default.RELAY_USER:
        _users.default.relayUser(data);

        break;

      case _.default.START_TIME_USER:
        _member.default.updateIsStartTime(data);

        break;

      case _.default.START_HANDRAISED_USER:
        _member.default.uploadHandRaised(data);

        break;

      case _.default.CONTROL_MIKES:
        _member.default.uploadControlMikes(data);

      case _.default.SLOW_SPEAK:
        _member.default.slowSpeak(data);

        break;

      case _.default.BBB_ON:
        Sender.bbbOn(data);
        break;

      case _.default.BBB_OFF:
        Sender.bbbOff(data);
        break;

      case _.default.SET_VOLUME_IN:
        _freeswitch.default.setVolumeIn(data);

        break;

      case _.default.UPDATE_USER_STATE:
        {
          const user = _user.default.find(client.user.id);

          user.updateUserState(data);
          const {
            prop
          } = data;

          switch (prop) {
            case 'mediaSettings':
              Sender.informChangeOnMediaSettings(user.id, user.userState.mediaSettings);
              break;
          }

          break;
        }

      case _.default.TOGGLE_RAISE_HAND:
        {
          const user = _user.default.find(client.user.id);

          user.toggleRaiseHand(data);
          break;
        }

      case _.default.TOGGLE_CONTROL_MIKE:
        {
          const user = _user.default.find(client.user.id);

          user.toggleControlMike();
          break;
        }

      default:
        console.log(`Socket: no such event: ${event}`);
    }
  } catch (e) {
    console.error(`Error: ${e}`);
  }
};

exports.default = _default;