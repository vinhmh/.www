"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = _interopRequireDefault(require("util"));

var _events = _interopRequireDefault(require("events"));

var _config = _interopRequireDefault(require("../../config"));

var _conferenceHandler = _interopRequireDefault(require("./handlers/conferenceHandler"));

var _sofiaHandler = _interopRequireDefault(require("./handlers/sofiaHandler"));

var _channelExecuteHander = _interopRequireDefault(require("./handlers/channelExecuteHander"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Esl extends _events.default {
  constructor(props) {
    super(props);

    _defineProperty(this, "init", connection => {
      this.connection = connection;
      connection.events('json', ['CHANNEL_EXECUTE', 'CHANNEL_EXECUTE_COMPLETE', 'CUSTOM conference::maintenance sofia::register'].join(' '), e => console.log('subscribed on: CUSTOM conference::maintenance'));
      connection.on('esl::**', e => {
        if (_config.default.eslDebug) {
          console.log(_util.default.inspect(e, {
            maxArrayLength: null
          }));
        }

        if (!e) return;

        switch (e.type) {
          case 'CUSTOM':
            this.conferenceHandler.process(e);
            this.sofiaHandler.process(e);
            break;

          case 'CHANNEL_EXECUTE':
          case 'CHANNEL_EXECUTE_COMPLETE':
            this.channelExecuteHander.process(e);
            break;
        }
      });
    });

    this.conferenceHandler = new _conferenceHandler.default(this);
    this.sofiaHandler = new _sofiaHandler.default(this);
    this.channelExecuteHander = new _channelExecuteHander.default(this);
  }

  kickMember(memberId, roomId) {
    return this.run(`conference ${roomId} kick ${memberId}`).catch(err => {
      console.error(`ESL: Unable to kick ${memberId} from ${roomId}: ${err}`);
    });
  }

  hupMember(memberId, roomId) {
    return this.run(`conference ${roomId} hup ${memberId}`).catch(err => {
      console.error(`ESL: Unable to hup ${memberId} in ${roomId}: ${err}`);
    });
  }

  toggleSpeak(memberId, roomId) {
    return this.run(`conference ${roomId} tmute ${memberId}`).catch(err => {
      console.error(`ESL: Unable toggle speak for ${memberId} in ${roomId}: ${err}`);
    });
  }

  toggleHear(memberId, roomId, hear) {
    const command = hear ? 'deaf' : 'undeaf';
    return this.run(`conference ${roomId} ${command} ${memberId}`).catch(err => {
      console.error(`ESL: Unable to toggle hear for ${memberId} in ${roomId}: ${err}`);
    });
  }

  muteSpeak(memberId, roomId) {
    return this.run(`conference ${roomId} mute ${memberId}`).catch(err => {
      console.error(`ESL: Unable to mute speak for ${memberId} in ${roomId}: ${err}`);
    });
  }

  unmuteSpeak(memberId, roomId) {
    return this.run(`conference ${roomId} unmute ${memberId}`).catch(err => {
      console.error(`ESL: Unable to unmute speak for ${memberId} in ${roomId}: ${err}`);
    });
  }

  muteHear(memberId, roomId) {
    return this.run(`conference ${roomId} deaf ${memberId}`).catch(err => {
      console.error(`ESL: Unable to mute hear for ${memberId} in ${roomId}: ${err}`);
    });
  }

  unmuteHear(memberId, roomId) {
    return this.run(`conference ${roomId} undeaf ${memberId}`).catch(err => {
      console.error(`ESL: Unable to unmute hear for ${memberId} in ${roomId}: ${err}`);
    });
  }

  volumeIn(memberId, roomId, level) {
    return this.run(`conference ${roomId} volume_in ${memberId} ${level}`).catch(err => {
      console.error(`ESL: Unable to set volume in for ${memberId} in ${roomId}: ${err}`);
    });
  }

  uuid_audio(uuid, command) {
    return this.run(`uuid_audio ${uuid} ${command}`).catch(err => {
      console.error(`ESL: Unable to run command '${command}' for uuid '${uuid}': ${err}`);
    });
  }

  run(command, callback) {
    return new Promise((resolve, reject) => {
      this.connection.bgapi(command, res => {
        if (res.getBody().indexOf('not found') !== -1) return reject(new Error("Not found"));
        if (callback) callback.call();
        resolve(res);
      });
    });
  }

}

var _default = new Esl();

exports.default = _default;