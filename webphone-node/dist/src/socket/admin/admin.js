"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _client = _interopRequireDefault(require("../client"));

var _socket = _interopRequireDefault(require("../socket"));

var _user = _interopRequireDefault(require("../../models/user"));

var _handler = _interopRequireDefault(require("./handler"));

var _adjustments = _interopRequireDefault(require("../../libs/adjustments"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const clientEvents = [_socket.default.NEW_USER, _socket.default.PROFILE_UPDATE, _socket.default.UPDATE_USER_STATE];
const serverEvents = [];

class Admin extends _socket.default {
  constructor(props) {
    super(props);
    this.handler = _handler.default;
    Admin.all.push(this);
    this.onInit();
  }

  onInit() {
    this.send({
      event: _socket.default.ALL_ADJUSTMENTS,
      data: _adjustments.default
    });
    this.send({
      event: _socket.default.ALL_USERS,
      data: _user.default.all
    });
  }

  static transmit(event, data, inbound = false) {
    const events = inbound ? serverEvents : clientEvents;
    if (!events.some(e => e === event)) return;
    Admin.broadcast(event, data);
  }

  static broadcast(event, data) {
    Admin.all.forEach(socket => socket.send({
      event,
      data
    }));
  }

}

exports.default = Admin;

_defineProperty(Admin, "all", []);

_defineProperty(Admin, "channels", {});