"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _esl = _interopRequireDefault(require("../esl"));

var _record = _interopRequireDefault(require("./record"));

var _user = _interopRequireDefault(require("./user"));

var _remote = _interopRequireDefault(require("./user/remote"));

var _member = _interopRequireDefault(require("../serializers/member"));

var _members = _interopRequireDefault(require("../services/members"));

var _freeswitch = _interopRequireDefault(require("../services/freeswitch"));

var _users = _interopRequireDefault(require("../services/users"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Member extends _record.default {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.roomId = data.roomId;
    this.nameId = data.nameId;
    this.speak = data.speak;
    this.hear = data.hear;
    this.talking = false;
    this.user = null;
    this.persisted = false;
    this.moderatorStatus = data.moderatorStatus || "OFFLINE";
    this.isStartTime = true;
    this.startStopTime = null;
    this.isResetTime = false;
    this.lastInterpreterSessionTime = null;
    this.startMeeting = false, this.startHandRaised = true, this.startStopHandRaised = null, this.startOnMikes = true, this.startStopMikes = null;
    this.slowSpeak = null;
  }

  destroy(o = {}) {
    const index = Member.all.indexOf(this);
    if (index !== -1) Member.all.splice(index, 1);
    this.user.removeMember(this);
    if (!o.skip_hup) _esl.default.hupMember(this.id, this.roomId);

    _members.default.delMember(this);

    _freeswitch.default.handleSwitcher(this.roomId);

    console.log(`Destroy member ${this.id}, user: ${this.user.username}`);
  }

  onUpdate() {
    if (!this.speak) this.talking = false;
  }

  toJSON() {
    return (0, _member.default)(this);
  }

  isFloor() {
    const {
      rooms,
      useFloor,
      useSwitcher
    } = this.user;
    return this.roomId === rooms.floor && (useFloor || useSwitcher);
  }

  static byRoom(...rooms) {
    return Member.all.filter(m => rooms.indexOf(m.roomId) !== -1);
  }

  static onJoin(member) {
    const {
      id,
      roomId,
      user
    } = member;
    const {
      orator,
      lounge,
      floor
    } = user.rooms; // switcher member

    if (user.isSwitcher()) return Member.onSwitcherJoin(member); // regular

    if (user.isRegular()) return;

    _users.default.update(user);

    return Member.onModeratorJoin(member);
  }

  static onSwitcherJoin(member) {
    const {
      roomId
    } = member;
    const moderatorSpeaking = Member.byRoom(roomId).filter(m => m.user.isModerator() && m.speak).length;

    if (moderatorSpeaking) {
      _esl.default.muteSpeak(member.id, roomId);
    } else {
      _esl.default.unmuteSpeak(member.id, roomId);
    }

    return _esl.default.muteHear(member.id, roomId);
  }

  static onModeratorJoin(member) {
    const {
      id,
      roomId,
      user
    } = member;
    const {
      hearRoomId,
      speakRoomId,
      rooms,
      useFloor,
      useSwitcher
    } = user;
    const {
      first,
      second
    } = rooms;
    const promises = [];
    if (!hearRoomId && roomId === first) user.hearRoomId = roomId;
    if (!speakRoomId && roomId === second) user.speakRoomId = roomId;
    if (roomId === user.rooms.floor) promises.push(_esl.default.muteHear(id, roomId));
    if (roomId !== user.speakRoomId) promises.push(_esl.default.muteSpeak(id, roomId));
    return Promise.all(promises);
  }

}

exports.default = Member;

_defineProperty(Member, "all", []);

_defineProperty(Member, "add", async ({
  id,
  roomId,
  nameId,
  speak,
  hear
}) => {
  const member = new Member({
    id,
    roomId,
    nameId,
    speak,
    hear
  });
  const oldMember = Member.find({
    nameId,
    roomId
  });
  if (oldMember) oldMember.destroy();
  Member.all.push(member);

  _user.default.addMember(member);

  Member.onJoin(member);
  member.persisted = true; // Floor

  const {
    user
  } = member;

  if (user.useFloor) {
    _freeswitch.default.handleFloor(roomId === user.rooms.floor ? user.hearRoomId : roomId);
  }

  _members.default.addMember(member);
});

_defineProperty(Member, "remove", id => {
  const member = Member.find(id);
  if (!member) return;
  member.destroy({
    skip_hup: true
  });

  _users.default.update(member.user);
});

_defineProperty(Member, "update", (id, data) => {
  const member = Member.find(id);
  if (!member) return;
  member.update(data);

  _members.default.updateMember(member);
});

_defineProperty(Member, "updateIsStartTime", data => {
  let member = Member.find(data.id);
  if (!member) return;
  member.startMeeting = data.startMeeting;
  member.user.startMeeting = data.startMeeting;
  member.isStartTime = data.isStartTime;
  member.startStopTime = data.startStopTime;
  member.isResetTime = data.isResetTime;
  member.user.isStartTime = data.isStartTime;
  member.user.startStopTime = data.startStopTime;
  member.user.isResetTime = data.isResetTime;
  member.user.lastInterpreterSessionTime = data.lastInterpreterSessionTime;
  member.lastInterpreterSessionTime = data.lastInterpreterSessionTime;

  _members.default.updateMember(member);
});

_defineProperty(Member, "uploadHandRaised", data => {
  let member = Member.find(data.id);
  if (!member) return;
  member.startMeeting = data.startMeeting;
  member.user.startMeeting = data.startMeeting;
  member.startHandRaised = data.startHandRaised;
  member.startStopHandRaised = data.startStopHandRaised;
  member.user.startHandRaised = data.startHandRaised;
  member.user.startStopHandRaised = data.startStopHandRaised;

  _members.default.updateMember(member);
});

_defineProperty(Member, "uploadControlMikes", data => {
  let member = Member.find(data.id);
  if (!member) return;
  member.startMeeting = data.startMeeting;
  member.user.startMeeting = data.startMeeting;
  member.startOnMikes = data.startOnMikes;
  member.startStopMikes = data.startStopMikes;
  member.user.startOnMikes = data.startOnMikes;
  member.user.startStopMikes = data.startStopMikes;

  _members.default.updateMember(member);
});

_defineProperty(Member, "slowSpeak", data => {
  let member = Member.find(data.id);
  if (!member) return;
  member.startMeeting = data.startMeeting;
  member.user.startMeeting = data.startMeeting;
  member.slowSpeak = data.slowSpeak;
  member.user.slowSpeak = data.slowSpeak;

  _members.default.updateMember(member);
});