"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = (user, options = {}) => {
  let result = {
    id: user.id,
    remote: true,
    username: user.username,
    displayName: user.displayName,
    shortName: user.shortName(),
    members: user.members,
    role: user.role,
    isSwitcher: user.isSwitcher(),
    isModerator: user.isModerator(),
    isRegular: user.isRegular(),
    isHear: user.isHear(),
    isSpeak: user.isSpeak(),
    connected: user.connected(),
    registered: user.registered,
    useFloor: user.useFloor,
    useSwitcher: user.useSwitcher,
    rooms: user.rooms,
    roomsList: user.roomsList,
    speakRoomId: user.speakRoomId,
    hearRoomId: user.hearRoomId,
    channels: user.channels,
    meetingID: user.meetingID,
    titlesMap: user.titlesMap,
    raiseHandTime: user.raiseHandTime,
    isStartTime: user.isStartTime,
    startStopTime: user.startStopTime,
    isResetTime: user.isResetTime,
    lastInterpreterSessionTime: user.lastInterpreterSessionTime,
    startMeeting: user.startMeeting,
    userState: user.userState,
    startHandRaised: user.startHandRaised,
    startStopHandRaised: user.startStopHandRaised,
    startOnMikes: user.startOnMikes,
    startStopMikes: user.startStopMikes,
    slowSpeak: user.slowSpeak,
    cf1: user.cf1,
    cf2: user.cf2
  };

  if (options.memberIds) {
    result.members = user.members.map(m => m.id);
  }

  return result;
};

exports.default = _default;