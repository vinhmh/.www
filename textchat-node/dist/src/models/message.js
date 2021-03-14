"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _helpers = require("../helpers");

var _record = _interopRequireDefault(require("./record"));

var _user = _interopRequireDefault(require("./user"));

var _meeting = _interopRequireDefault(require("./meeting"));

var _serializers = require("../serializers");

var _services = require("../services");

var _config = _interopRequireDefault(require("../../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// TODO move to redis
let id = 0;

class Message extends _record.default {
  constructor(data) {
    super(data);
    this.id = ++id;
    this.lang = data.lang;
    this.user = _user.default.find(data.userId);
    this.meeting = _meeting.default.find(data.meetingId);
    this.text = {
      [data.lang]: data.text,
      toString: () => this.originalText()
    };
    this.file = data.file;
    this.createdAt = +new Date();
  }

  originalText() {
    return this.text[this.lang];
  }

  destroy() {
    const index = Message.all.indexOf(this);

    if (index !== -1) {
      Message.all.splice(index, 1);
      console.log('Destroy Message', this.id);
    }
  }

  toJSON() {
    return (0, _serializers.MessageSerializer)(this);
  }

  static async add(client, data) {
    const message = new Message(data);
    const languageConfigs = client.getDeepLSupports(message.user.id);
    await Message.translate(message, languageConfigs);
    Message.all.push(message);

    _services.MessagesService.add(message);
  }

  static async translate(message, languageConfigs) {
    const {
      deepLSupports,
      languagesConfig
    } = languageConfigs;
    const original = message.originalText(); // const rs 

    const requests = () => languagesConfig.split(',').filter(lang => lang && lang !== message.lang).map(lang => {
      const callback = data => {
        const {
          text
        } = data.translations[0];
        message.text = { ...message.text,
          [lang]: text
        };
      };

      return Message.deepl(original, message.lang, lang, callback, deepLSupports);
    });

    await Promise.all(requests()).then(rs => {
      rs = rs;
    });
    return rs; // return Promise.all(requests())
  }

  static async deepl(text, source, target, callback = null, deepLSupports) {
    const finalSource = deepLSupports.findIndex(l => l.language == source) > -1 ? source : 'EN';
    const finalTarget = deepLSupports.findIndex(l => l.language == target) > -1 ? target : 'EN';
    const url = `${_config.default.apiUrl}?text=${encodeURIComponent(text)}&source_lang=${finalSource}&target_lang=${finalTarget}&auth_key=${_config.default.authKey}`;

    try {
      const response = await _axios.default.get(url);
      if (callback) callback(response.data);
      return response;
    } catch (error) {
      return null;
    }
  }

  static byMeeting(meeting) {
    const meetingId = (0, _helpers.getId)(meeting);
    return Message.all.filter(m => {
      if (typeof m.meeting === 'undefined') return;
      return m.meeting.id === meetingId;
    });
  }

  static byUserMeeting(user, meeting) {
    const userId = (0, _helpers.getId)(user);
    const meetingId = (0, _helpers.getId)(meeting);
    return Message.all.filter(m => m.user.id === userId && m.meeting.id === meetingId);
  }

  static removeMessagesByMeeting({
    meetingId
  }) {
    if (!meetingId) return;
    const newListMessages = Message.all.filter(m => typeof m.meeting != "undefined" && m.meeting.id != meetingId);
    Message.all = newListMessages;

    _services.MessagesService.deleteChatSuccess({
      meetingId
    });
  }

}

exports.default = Message;

_defineProperty(Message, "all", []);