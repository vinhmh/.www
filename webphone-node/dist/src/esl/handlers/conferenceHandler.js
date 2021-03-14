"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _member = _interopRequireDefault(require("../../models/member"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ADD_MEMBER = 'ADD_MEMBER';
const DEL_MEMBER = 'DEL_MEMBER';
const TOGGLE_SPEAK = 'TOGGLE_SPEAK';
const TOGGLE_HEAR = 'TOGGLE_HEAR';
const TOGGLE_TALKING = 'TOGGLE_TALKING';

class ConferenceHandler {
  constructor(esl) {
    this.esl = esl;
    this.subscribe();
  }

  subscribe() {
    this.esl.on(ADD_MEMBER, _member.default.add).on(DEL_MEMBER, _member.default.remove).on(TOGGLE_SPEAK, _member.default.update).on(TOGGLE_HEAR, _member.default.update).on(TOGGLE_TALKING, _member.default.update);
  }

  process(e) {
    const eventSubclass = e.getHeader('Event-Subclass');
    if (eventSubclass !== 'conference::maintenance') return;
    const action = e.getHeader('Action');

    switch (action) {
      case 'add-member':
        return this.onAddMember(e);

      case 'del-member':
        return this.onDelMember.call(this, e);

      case 'mute-member':
      case 'unmute-member':
        return this.onToggleSpeak.call(this, e, action);

      case 'deaf-member':
      case 'undeaf-member':
        return this.onToggleHear(e, action);

      case 'start-talking':
      case 'stop-talking':
        return this.onToggleTalking(e);

      case 'volume-in-member':
        // Handle volume_in
        break;
    }
  }

  onAddMember(e) {
    const id = e.getHeader('Member-ID');
    const roomId = e.getHeader('Conference-Name');
    const nameId = e.getHeader('Caller-Caller-ID-Name');
    const speak = e.getHeader('Speak') === 'true';
    const hear = e.getHeader('Hear') === 'true';
    console.log(`Conference ${roomId}, add Member ${id}, ${nameId}`);
    this.esl.emit(ADD_MEMBER, {
      id,
      roomId,
      nameId,
      speak,
      hear
    });
  }

  onDelMember(e) {
    const id = e.getHeader('Member-ID');
    const nameId = e.getHeader('Caller-Caller-ID-Name');
    const roomId = e.getHeader('Conference-Name');
    console.log(`Conference ${roomId}, del Member ${id}, ${nameId}`);
    this.esl.emit(DEL_MEMBER, id, roomId);
  }

  onToggleSpeak(e, event) {
    const id = e.getHeader('Member-ID');
    const speak = e.getHeader('Speak') === 'true';
    const nameId = e.getHeader('Caller-Caller-ID-Name');
    const roomId = e.getHeader('Conference-Name');
    console.log(`Conference ${roomId}, ${event} Member ${id}, ${nameId}`);
    this.esl.emit(TOGGLE_SPEAK, id, {
      speak
    });
  }

  onToggleHear(e, event) {
    const id = e.getHeader('Member-ID');
    const hear = e.getHeader('Hear') === 'true';
    const nameId = e.getHeader('Caller-Caller-ID-Name');
    const roomId = e.getHeader('Conference-Name');
    console.log(`Conference ${roomId}, ${event} Member ${id}, ${nameId}`);
    this.esl.emit(TOGGLE_HEAR, id, {
      hear
    });
  }

  onToggleTalking(e) {
    const id = e.getHeader('Member-ID');
    const nameId = e.getHeader('Caller-Caller-ID-Name');
    const roomId = e.getHeader('Conference-Name');
    const talking = e.getHeader('Talking') === 'true';
    console.log(`Conference ${roomId}, member ${id} ${nameId} talking ${talking}`);
    this.esl.emit(TOGGLE_TALKING, id, {
      talking
    });
  }

}

exports.default = ConferenceHandler;