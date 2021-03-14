"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _user = _interopRequireDefault(require("../../models/user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ECHO_TEST = 'ECHO_TEST';

class ChannelExecuteHander {
  constructor(esl) {
    this.esl = esl;
    this.subscribe();
  }

  subscribe() {
    this.esl.on(ECHO_TEST, _user.default.onEchoTest);
  }

  process(e) {
    this.application = e.getHeader('Application');

    switch (e.type) {
      case 'CHANNEL_EXECUTE':
        this.complete = false;
        break;

      case 'CHANNEL_EXECUTE_COMPLETE':
        this.complete = true;
        break;
    }

    this.channelExecute(e);
  }

  channelExecute(e) {
    switch (this.application) {
      case 'echo':
        return this.onEchoTest(e);
    }
  }

  onEchoTest(e) {
    const start = !this.complete;
    const nameId = e.getHeader('Caller-Caller-ID-Name');
    const uuid = e.getHeader('Channel-Call-UUID');
    this.esl.emit(ECHO_TEST, {
      nameId,
      uuid,
      start
    });
  }

}

exports.default = ChannelExecuteHander;