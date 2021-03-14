"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = (user, options = {}) => {
  const result = {
    id: user.id,
    remote: false,
    client: user.client,
    host: user.host,
    bbb: user.bbb,
    platformUrl: user.platformUrl,
    username: user.username,
    usernameInput: user.usernameInput,
    password: user.password,
    displayName: user.displayName,
    shortName: user.shortName(),
    members: user.members,
    role: user.role,
    isSwitcher: user.isSwitcher(),
    isModerator: user.isModerator(),
    isRegular: user.isRegular(),
    isTechAssistant: user.isTechAssistant(),
    isAdministrator: user.isAdministrator(),
    isHear: user.isHear(),
    isSpeak: user.isSpeak(),
    connected: user.connected(),
    registered: user.registered,
    useFloor: user.useFloor,
    useSwitcher: user.useSwitcher,
    rooms: user.rooms,
    roomsList: user.roomsList,
    inLoungeRoom: user.inLoungeRoom(),
    inOratorRoom: user.inOratorRoom(),
    inLangbRoom: user.inLangbRoom(),
    isFloorHear: user.isFloorHear(),
    hearBoth: user.hearBoth(),
    speakRoomId: user.speakRoomId,
    hearRoomId: user.hearRoomId,
    channels: user.channels,
    echoUuid: user.echoUuid,
    browserID: user.browserID,
    meetingID: user.meetingID,
    titlesMap: user.titlesMap,
    raiseHandTime: user.raiseHandTime,
    isStartTime: user.isStartTime,
    startStopTime: user.startStopTime,
    isResetTime: user.isResetTime,
    startMeeting: true,
    lastInterpreterSessionTime: user.lastInterpreterSessionTime,
    userState: user.userState,
    startHandRaised: user.startHandRaised,
    startStopHandRaised: user.startStopHandRaised,
    startOnMikes: user.startOnMikes,
    startStopMikes: user.startStopMikes,
    slowSpeak: user.slowSpeak,
    cf1: user.cf1,
    cf2: user.cf2,
    isLockMike: user.isLockMike
  };

  if (options.memberIds) {
    result.members = user.members.map(m => m.id);
  }

  return result;
};

exports.default = _default;