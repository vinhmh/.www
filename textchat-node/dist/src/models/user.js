"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serializers = require("../serializers");

var _services = require("../services");

var _record = _interopRequireDefault(require("./record"));

var _meeting = _interopRequireDefault(require("./meeting"));

var _socket = _interopRequireDefault(require("../socket"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class User extends _record.default {
  constructor(client, data) {
    super();
    this.id = data.currentUserId;
    this.username = data.username;
    this.meeting = null;
    this.meetings = [];
    this.channel = Math.random().toString(36).substr(2);
    this.setupClient(client);
    this.department = data.department || 'participant';
  }

  setupClient(client) {
    this.client = client;
    this.client.user = this;
    this.client.addChannel(this.channel);
    this.client.addChannel(this.meetings.map(m => m.channel));
    this.client.addCallback(_socket.default.CLOSED, () => this.disable());
  }

  disable() {
    const listMeeting = this.meetings;
    this.meetings = [];
    this.meeting = null;

    for (const meeting of listMeeting) {
      if (!meeting) return; // if there are some other other users in the meeting

      if (meeting.users.some(u => {
        return u.meetings && u.meetings.findIndex(m => m.id === meeting.id) > -1;
      })) {
        _services.UsersService.disable(this, meeting.channel);
      } else {
        meeting.destroy();
      }
    } // const meeting = this.meeting //  eslint-disable-line  prefer-destructuring

  }

  destroy() {
    this.client && this.client.close();
    this.client = null;
    const index = User.all.indexOf(this);

    if (index !== -1) {
      User.all.splice(index, 1);
      console.log('Destroy user', this.id);
    }
  }

  findMeeting(meeting) {
    return this.meetings.find(m => m.id === meeting.id);
  }

  addMeeting(meeting) {
    this.meeting = meeting;
    if (this.findMeeting(meeting.id)) return;
    this.meetings.push(meeting);
    this.client.addChannel(meeting.channel);
  }

  removeMeeting(meeting) {
    const index = this.meetings.indexOf(meeting);
    if (index !== -1) this.meetings.splice(index, 1);
    this.client && this.client.removeChannel(meeting.channel);
    if (this.meetings.length) return;
    this.destroy();
  }

  toJSON() {
    return (0, _serializers.UserSerializer)(this);
  }

  static async add(client, data) {
    const meeting = await _meeting.default.findOrCreate({
      title: data.meetingID,
      role: data.role,
      type: 'Public'
    });
    if (!meeting || !client || typeof data.currentUserId === 'undefined') return client.close(); // TODO find user by uniq  data.token

    const user = new User(client, data, meeting);
    User.all.push(user);
    meeting.addUser(user);
    user.addMeeting(meeting);
    const deepLSupports = client.getDeepLSupports(user.id);

    _services.UsersService.load(user, deepLSupports.deepLSupports);

    _services.MeetingsService.add(meeting);

    if (data.department == 'technical') {
      const techPublicMeeting = await _meeting.default.findOrCreateForTechnicalTeam({
        title: data.meetingID,
        role: data.role,
        type: 'TechnicalPublic'
      });
      techPublicMeeting.addUser(user);
      user.addMeeting(techPublicMeeting);

      _services.MeetingsService.add(techPublicMeeting);

      _services.MeetingsService.messagesChangeToNewUser(techPublicMeeting, [user.id]);

      const listTechMeeting = _meeting.default.all.filter(m => m.type == 'Technical');

      for (const techMeeting of listTechMeeting) {
        techMeeting.addUser(user);
        user.addMeeting(techMeeting);

        _services.MeetingsService.add(techMeeting);

        _services.MeetingsService.messagesChangeToNewUser(techMeeting, [user.id]);
      }
    }

    if (data.department == 'moderator') {
      const moderatorPublicMeeting = await _meeting.default.findOrCreateForModeratorTeam({
        title: data.meetingID,
        role: data.role,
        type: 'InterpreterPublic'
      });
      moderatorPublicMeeting.addUser(user);
      user.addMeeting(moderatorPublicMeeting);

      _services.MeetingsService.add(moderatorPublicMeeting);

      _services.MeetingsService.messagesChangeToNewUser(moderatorPublicMeeting, [user.id]);

      const {
        speakRoomId,
        hearRoomId
      } = data;
      const moderatorCabinMeeting = await _meeting.default.findOrCreateForModeratorTeamSameCabin({
        title: data.meetingID,
        role: data.role,
        type: 'InterpreterCabin',
        speakRoomId,
        hearRoomId
      });
      moderatorCabinMeeting.addUser(user);
      user.addMeeting(moderatorCabinMeeting);

      _services.MeetingsService.add(moderatorCabinMeeting);

      _services.MeetingsService.messagesChangeToNewUser(moderatorCabinMeeting, [user.id]);
    }
  }

}

exports.default = User;

_defineProperty(User, "all", []);