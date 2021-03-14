"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _user = _interopRequireDefault(require("../models/user"));

var _freeswitch = _interopRequireDefault(require("../services/freeswitch"));

var _socket = _interopRequireWildcard(require("../socket"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Adjustments {
  constructor() {
    if (Adjustments.instance) {
      return Adjustments.instance;
    }

    this.demoMode = false;
    this.meetings = {};
    Adjustments.instance = this;
  }

  toggle(name) {
    const previous = !!this[name];
    this[name] = !this[name];

    switch (name) {
      case 'demoMode':
        if (!previous) {
          _user.default.all.filter(user => user.isRegular() && user.isSpeak()).forEach(user => _freeswitch.default.muteSpeakRegular(user));
        }

        break;

      default:
        console.log('No Adjustments to toggle');
        return;
    }

    this.notify();
  }

  toggleMeeting(name, meetingId) {
    if (!this.meetings[meetingId]) this.meetings[meetingId] = {};
    const meeting = this.meetings[meetingId];
    const previous = !!meeting[name];
    meeting[name] = !meeting[name];

    switch (name) {
      case 'floorDisabled':
        _user.default.all.filter(user => user.isModerator() && (user.isFloorHear() || user.inOratorRoom())).forEach(user => _freeswitch.default.pickState(user, 'RELAY'));

        _freeswitch.default.handleFloorForMeeting(meetingId);

        break;

      default:
        console.log('No Adjustments to toggle');
        return;
    }

    this.notify();
  }

  notify() {
    _socket.Sender.adjustments(_socket.default.PUBLIC_CHANNEL, this);

    _socket.AdminSender.adjustments(this);
  }

  toJSON() {
    return {
      demoMode: this.demoMode,
      meetings: this.meetings
    };
  }

}

_defineProperty(Adjustments, "instance", void 0);

var _default = new Adjustments();

exports.default = _default;