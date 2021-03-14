"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _record = _interopRequireDefault(require("../record"));

var _socket = _interopRequireWildcard(require("../../socket"));

var _index = _interopRequireWildcard(require("./index"));

var _userHelper = require("../../helpers/userHelper");

var _config = _interopRequireDefault(require("../../../config"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let id = 0;

class BaseUser extends _record.default {
  constructor(data) {
    super(data);
    this.id = ++id;
    this.userState = {
      mediaSettings: {},
      debugInfo: {
        browserData: {},
        errors: [],
        janusLog: [],
        turnStun: []
      },
      activeChannel: _socket.default.PUBLIC_CHANNEL
    };
    this.role = 'regular';
  }

  isModerator() {
    return this.role === BaseUser.ROLES.INTERPRETER;
  }

  isRegular() {
    return this.role === BaseUser.ROLES.REGULAR;
  }

  isTechAssistant() {
    var _this$usernameInput;

    return !!((_this$usernameInput = this.usernameInput) !== null && _this$usernameInput !== void 0 && _this$usernameInput.match(/^_ibp_techassist/));
  }

  isAdministrator() {
    return !!this.isModeratorEndUser;
  }

  isSwitcher() {
    return this.role === BaseUser.ROLES.SWITCHER;
  }

  isHear() {
    return !!this.members.find(m => m.hear);
  }

  isSpeak() {
    return !!this.members.find(m => m.speak);
  }

  shortName() {
    return (0, _userHelper.shortName)(this.displayName);
  }

  destroy() {
    let memberIndex = this.members.length - 1;

    while (memberIndex >= 0) {
      const member = this.members[memberIndex];
      member.destroy();
      memberIndex -= 1;
    }

    const index = this.constructor.all.indexOf(this);

    if (index !== -1) {
      this.constructor.all.splice(index, 1);
      console.log('Destroy user', this.id);
    }

    _socket.AdminSender.removeUser(this.id);
  }

  memberByRoomId(roomId) {
    return this.members.find(m => m.roomId === roomId);
  }

  removeMember(member) {
    const index = this.members.findIndex(m => m.id === member.id);
    if (index === -1) return;
    this.members.splice(index, 1);
    this.onMemberRemove(member);
  }

  onMemberAdd()
  /* member */
  {// overwrite in inherited class
  }

  onMemberRemove()
  /* member */
  {// overwrite in inherited class
  }

  static makeUniq(user) {
    if (user.browserID) {
      // make only one tab opened with the same browserID
      _index.default.all.filter(u => u.browserID === user.browserID && u.id !== user.id).forEach(u => _socket.Sender.closeWindow(u.channels.self));
    }

    if (user.isSwitcher()) {
      // allow one switcher per meeting
      const swithcers = _index.default.all.filter(u => u.meetingID === user.meetingID && u.role === BaseUser.ROLES.SWITCHER && u.id !== user.id);

      swithcers.forEach(sw => sw.destroy());
    }

    const oldUser = this.find({
      username: user.username
    });
    if (!oldUser) return;

    if (oldUser.client) {
      _socket.Sender.closeWindow(oldUser.channels.self);
    } else {
      oldUser.destroy();
    }
  }

  static onRegister() {// overwrite in inherited class
  }

  static addMember(member) {
    const {
      nameId,
      roomId
    } = member;

    let user = _index.default.find({
      username: nameId
    });

    if (!user) user = _index.RemoteUser.findOrCreate({
      nameId,
      roomId
    });
    member.user = user;
    user.members.push(member);
    user.onMemberAdd(member);
  }

}

exports.default = BaseUser;

_defineProperty(BaseUser, "ROLES", {
  INTERPRETER: 'interpreter',
  MODERATOR: 'moderator',
  REGULAR: 'regular',
  TECH_ASSISTANT: 'tech_assistant',
  SWITCHER: 'switcher'
});