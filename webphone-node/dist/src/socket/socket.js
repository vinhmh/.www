"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _config = _interopRequireDefault(require("../../config"));

var _socket = _interopRequireDefault(require("../serializers/socket"));

var constants = _interopRequireWildcard(require("./constants"));

var _admin = _interopRequireDefault(require("./admin"));

var _client = _interopRequireDefault(require("./client"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let id = 0;

class Socket extends _events.default {
  constructor(connection) {
    super();

    _defineProperty(this, "trigger", (event, data) => {
      this.observer.add(event);
      this.emit(event, data);
    });

    _defineProperty(this, "onMessage", message => {
      try {
        const msg = JSON.parse(message.utf8Data);
        this.handler(msg.event, this, msg.data);
        this.onMessageCallback(msg.event, msg.data);
      } catch (e) {
        console.error(`Error receiving message: ${e}`);
      }
    });

    _defineProperty(this, "onClose", () => {
      this.cleanUpSocket();
      this.trigger(Socket.CLOSED); // Let time for socket to trigger the event and delete the user before removing listeners

      setTimeout(this.removeAllListeners, 5000);
    });

    this.id = ++id;
    this.connection = connection;
    this.channels = new Set();
    this.user = null;
    this.observer = new Set();
    this.connection.on('message', this.onMessage);
    this.connection.on('close', this.onClose);
  }

  addCallback(event, callback) {
    if (this.observer.has(event)) return callback.call();
    this.once(event, callback);
  }

  onMessageCallback(event, data) {//callback
  }

  send(data) {
    try {
      this.connection.sendUTF(JSON.stringify(data));
    } catch (e) {
      console.error(`Error sending message: ${e}`);
    }
  }

  close() {
    console.log('Closing socket');
    this.onClose();

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  cleanUpSocket() {
    let socketIds;
    const Class = this.constructor;
    const index = Class.all.indexOf(this);
    if (index !== -1) Class.all.splice(index, 1); // remove from sockets list

    this.channels.forEach(item => {
      // remove id from channels obj
      socketIds = Class.channels[item];
      if (!socketIds) return;
      socketIds.delete(this.id);
      if (!socketIds.size) delete Class.channels[item];
    });
  }

  addChannel(...channel) {
    const Class = this.constructor;

    const add = channel => {
      if (channel instanceof Array || channel instanceof Set) {
        channel.forEach(item => add(item));
        return;
      }

      Class.channels[channel] || (Class.channels[channel] = new Set());
      Class.channels[channel].add(this.id);
      this.channels.add(channel);
    };

    add(channel);
  }

  toJSON() {
    return (0, _socket.default)(this);
  }

  static broadcast(channel, event, data) {
    let socket;
    let ids;
    const socketIds = new Set();

    const bc = channel => {
      if (Array.isArray(channel)) return channel.forEach(item => bc(item));
      ids = this.channels[channel];
      if (!ids) return;
      ids.forEach(id => socketIds.add(id));
    };

    bc(channel);
    socketIds.forEach(id => {
      socket = this.find(id);
      if (socket) socket.send({
        event,
        data
      });
    });
    this.onBroadcastCallback(event, data);
  }

  static onBroadcastCallback(event, data) {//callback
  }

  static find(id) {
    return this.all.find(socket => socket.id === id);
  }

  static byUser(userId) {
    return this.all.find(socket => socket.user && socket.user.id === userId);
  }

  static create(connection, options = {}) {
    let Class = _client.default;
    const {
      secretToken
    } = options.query || {};

    if (secretToken) {
      if (secretToken !== _config.default.secretToken) return connection.close();
      Class = _admin.default;
    }

    return new Class(connection, options);
  }

}

exports.default = Socket;

for (const c in constants) Socket[c] = constants[c];