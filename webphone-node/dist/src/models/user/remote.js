"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _base = _interopRequireDefault(require("./base"));

var _remote = _interopRequireDefault(require("../../serializers/user/remote"));

var _userHelper = require("../../helpers/userHelper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class RemoteUser extends _base.default {
  constructor(data) {
    super(data);
    this.username = data.nameId;
    this.displayName = (0, _userHelper.displayName)(data.nameId);
    this.members = [];
    this.role = RemoteUser.ROLES.REGULAR;
    this.hearRoomId = data.roomId;
    this.speakRoomId = data.roomId;
    this.meetingID = null;
    this.useFloor = false;
    this.useSwitcher = false;
    this.registered = true;
    this.cf1 = data.roomId;
    this.cf2 = null;
    this.rooms = {
      first: data.roomId,
      second: null,
      orator: null
    };
    this.roomsList = [data.roomId];
    this.channels = {
      self: '__remote__'
    };
    this.isStartTime = true;
    this.startStopTime = null;
    this.isResetTime = false;
    this.lastInterpreterSessionTime = null;
    this.startMeeting = false, this.startHandRaised = true, this.startStopHandRaised = null, this.startOnMikes = true, this.startStopMikes = null;
    this.slowSpeak = null;
  }

  connected() {
    return this.members.length > 1;
  }

  onMemberRemove()
  /* member */
  {
    if (!this.members.length) this.destroy();
  }

  toJSON() {
    return (0, _remote.default)(this);
  }

}

exports.default = RemoteUser;

_defineProperty(RemoteUser, "all", []);

_defineProperty(RemoteUser, "add", data => {
  const user = new RemoteUser(data);
  RemoteUser.makeUniq(user);
  RemoteUser.all.push(user);
  console.log(`Create remote user ${user.id}`);
  return user;
});

_defineProperty(RemoteUser, "findOrCreate", data => {
  const user = RemoteUser.find(data.nameId);
  if (user) return user;
  return RemoteUser.add(data);
});