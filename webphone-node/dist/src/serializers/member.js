"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _user = _interopRequireDefault(require("./user"));

var _remote = _interopRequireDefault(require("./user/remote"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = member => {
  const serializeUser = user => {
    const remote = user.constructor.name === 'RemoteUser';

    if (remote) {
      return (0, _remote.default)(user, {
        memberIds: true
      });
    }

    return (0, _user.default)(user, {
      memberIds: true
    });
  };

  return {
    id: member.id,
    user: serializeUser(member.user),
    roomId: member.roomId,
    nameId: member.nameId,
    speak: member.speak,
    hear: member.hear,
    talking: member.talking,
    userId: member.user.id,
    moderatorStatus: member.moderatorStatus,
    isStartTime: member.isStartTime,
    startStopTime: member.startStopTime,
    isResetTime: member.isResetTime,
    lastInterpreterSessionTime: member.lastInterpreterSessionTime,
    startMeeting: member.startMeeting,
    startHandRaised: member.startHandRaised,
    startStopHandRaised: member.startStopHandRaised,
    startOnMikes: member.startOnMikes,
    startStopMikes: member.startStopMikes,
    slowSpeak: member.slowSpeak
  };
};

exports.default = _default;