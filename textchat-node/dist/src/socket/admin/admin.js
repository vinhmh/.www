"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _client = _interopRequireDefault(require("../client"));

var _socket = _interopRequireDefault(require("../socket"));

var _handler = _interopRequireDefault(require("./handler"));

var Sender = _interopRequireWildcard(require("./sender"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const subscribedClientEvents = [// Socket.USER_NEW,
  // Socket.USER_UPDATE
];

class Admin extends _socket.default {
  constructor(props) {
    super(props);
    this.handler = _handler.default;
  }

  // {channel_name: Set [ instanceId ]}
  static add(connection) {
    const socket = new Admin(connection);
    Admin.all.push(socket);
    Sender.usersAll();
    return socket;
  }

  static transmit(event, data) {
    if (!subscribedClientEvents.some(e => e === event)) return;
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