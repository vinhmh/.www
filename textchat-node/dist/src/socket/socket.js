"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var constants = _interopRequireWildcard(require("./constants"));

var _admin = _interopRequireDefault(require("./admin"));

var _client = _interopRequireDefault(require("./client"));

var _config = _interopRequireDefault(require("../../config"));

var _axios = _interopRequireDefault(require("axios"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let id = 0;

class Socket extends _events.default {
  constructor(connection) {
    super();

    _defineProperty(this, "getDeepLSupports", id => {
      const Class = this.constructor;
      return {
        deepLSupports: !!Class.all.find(s => s.webphoneUserId == id) && Class.all.find(s => s.webphoneUserId == id).deepLSupports,
        languagesConfig: this.languagesConfig
      };
    });

    _defineProperty(this, "trigger", (event, data) => {
      this.observer.add(event);
      this.emit(event, data);
    });

    _defineProperty(this, "onMessage", message => {
      try {
        const msg = JSON.parse(message.utf8Data);
        this.handler(msg.event, this, msg.data);
      } catch (e) {
        console.error(`[WebPhone] exception: ${e.stack}`);
      }
    });

    _defineProperty(this, "onClose", () => {
      this.cleanUpSocket();
      this.trigger(Socket.CLOSED);
      this.removeAllListeners();
    });

    this.id = ++id;
    this.connection = connection;
    this.deepLSupports = null;
    this.channels = new Set();
    this.webphoneUserId = connection.webphoneUserId;
    this.languagesConfig = connection.languagesConfig;
    this.deepLSupports = connection.deepLSupports;
    this.user = null;
    this.observer = new Set();
    this.connection.on('message', this.onMessage);
    this.connection.on('close', this.onClose);
  }

  addCallback(event, callback) {
    if (this.observer.has(event)) return callback.call();
    this.once(event, callback);
  }

  send(data) {
    this.connection.sendUTF(JSON.stringify(data));
  }

  close() {
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

    this.channels.forEach(channel => {
      // remove id from channels obj
      socketIds = Class.channels[channel];
      if (!socketIds) return;
      socketIds.delete(this.id);
      if (!socketIds.size) delete Class.channels[channel];
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

  addChannelWhenCreateNewMeeting(channel, allUsersInNewMeeting) {
    const Class = this.constructor;

    const add = channel => {
      if (channel instanceof Array || channel instanceof Set) {
        channel.forEach(item => add(item));
        return;
      }

      const allSocketByUser = Class.all.filter(socket => !allUsersInNewMeeting.every(id => parseInt(socket.webphoneUserId) !== parseInt(id)));
      Class.channels[channel] || (Class.channels[channel] = new Set());

      for (const socket of allSocketByUser) {
        Class.channels[channel].add(socket.id);
      }

      this.channels.add(channel);
    };

    add(channel);
  }

  removeChannel(...channel) {
    const Class = this.constructor;

    const remove = channel => {
      if (channel instanceof Array || channel instanceof Set) {
        channel.forEach(item => remove(item));
        return;
      }

      const socketIds = Class.channels[channel];
      if (!socketIds) return;
      socketIds.delete(this.id);
      if (!socketIds.size) delete Class.channels[channel];
      this.channels.delete(channel);
    };

    remove(channel);
  }

  removeUserChannel(channel, userIdToRemove) {
    const Class = this.constructor;

    const remove = channel => {
      if (channel instanceof Array || channel instanceof Set) {
        channel.forEach(item => remove(item));
        return;
      }

      const socketId = Class.all.find(s => s.webphoneUserId == userIdToRemove).id;
      const socketIds = Class.channels[channel];
      if (!socketIds) return;
      socketIds.delete(socketId);
      if (!socketIds.size) delete Class.channels[channel];
      this.channels.delete(channel);
    };

    remove(channel);
  }

  static find(id) {
    return this.all.find(socket => socket.id === id);
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
      if (!socket) return;
      socket.send({
        event,
        data
      });
    });

    _admin.default.transmit(event, data);
  }

  static create(connection, options = {}) {
    let Class = _client.default;
    const {
      secretToken,
      webphoneUserId,
      languagesConfig,
      deepLSupports
    } = options.query || {};

    if (secretToken) {
      if (secretToken !== _config.default.secretToken) return connection.close();
      Class = _admin.default;
    }

    return Class.add(connection, {
      webphoneUserId,
      languagesConfig,
      deepLSupports
    });
  }

}

exports.default = Socket;

for (const c in constants) Socket[c] = constants[c];