"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeUser = exports.deleteChatSuccess = exports.meetingsAdd = exports.messagesAdd = exports.appLoaded = exports.messagesUpdateUser = exports.messagesChange = exports.userUpdate = exports.userChange = void 0;

var _ = _interopRequireDefault(require("."));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const userChange = (channel, data) => {
  _.default.broadcast(channel, _.default.USER_CHANGE, data);
};

exports.userChange = userChange;

const userUpdate = (channel, data) => {
  _.default.broadcast(channel, _.default.USER_UPDATE, data);
};

exports.userUpdate = userUpdate;

const messagesChange = (channel, data) => {
  _.default.broadcast(channel, _.default.MESSAGES_CHANGE, data);
};

exports.messagesChange = messagesChange;

const messagesUpdateUser = (channel, data) => {
  _.default.broadcast(channel, _.default.MESSAGES_UPDATE_USER, data);
};

exports.messagesUpdateUser = messagesUpdateUser;

const appLoaded = (channel, data) => {
  _.default.broadcast(channel, _.default.APP_LOADED, data);
};

exports.appLoaded = appLoaded;

const messagesAdd = (channel, data) => {
  _.default.broadcast(channel, _.default.MESSAGES_ADD, data);
};

exports.messagesAdd = messagesAdd;

const meetingsAdd = (channel, data) => {
  _.default.broadcast(channel, _.default.MEETINGS_ADD, data);
};

exports.meetingsAdd = meetingsAdd;

const deleteChatSuccess = (channel, data) => {
  _.default.broadcast(channel, _.default.DELETE_CHAT_SUCCESS, data);
};

exports.deleteChatSuccess = deleteChatSuccess;

const removeUser = (channel, data) => {
  _.default.broadcast(channel, _.default.REMOVE_USER, data);
};

exports.removeUser = removeUser;