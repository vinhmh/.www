"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = _interopRequireDefault(require("../socket"));

var _handler = _interopRequireDefault(require("./handler"));

var _admin = _interopRequireDefault(require("../admin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Client extends _socket.default {
  constructor(props) {
    super(props);

    _defineProperty(this, "onMessageCallback", (event, data) => {
      _admin.default.transmit(event, data, true);
    });

    this.handler = _handler.default;
    Client.all.push(this);
  }

  static onBroadcastCallback(event, data) {
    _admin.default.transmit(event, data);
  }

}

exports.default = Client;

_defineProperty(Client, "all", []);

_defineProperty(Client, "channels", {});