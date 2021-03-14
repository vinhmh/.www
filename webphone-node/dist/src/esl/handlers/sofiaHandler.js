"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _user = _interopRequireDefault(require("../../models/user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REGISTER_USER = 'REGISTER_USER';

class SofiaHandler {
  constructor(esl) {
    this.esl = esl;
    this.subscribe();
  }

  subscribe() {
    this.esl.on(REGISTER_USER, _user.default.onRegister);
  }

  process(e) {
    const eventSubclass = e.getHeader('Event-Subclass');
    if (eventSubclass !== 'sofia::register') return;
    const username = e.getHeader('username');
    this.esl.emit(REGISTER_USER, {
      username
    });
  }

}

exports.default = SofiaHandler;