"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adjustments = exports.closeWindow = exports.notify = exports.makeRelay = exports.langbLineCall = exports.oratorLineCall = exports.loungeLineCall = exports.floorLineCall = exports.secondLineCall = exports.firstLineCall = exports.updateMember = exports.delMember = exports.addMember = exports.changeMembers = exports.updateProfile = exports.newUser = void 0;

var _ = _interopRequireDefault(require("."));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const newUser = (channel, data) => {
  _.default.broadcast(channel, _.default.NEW_USER, data);
};

exports.newUser = newUser;

const updateProfile = (channel, data) => {
  _.default.broadcast(channel, _.default.PROFILE_UPDATE, data);
};

exports.updateProfile = updateProfile;

const changeMembers = (channel, data) => {
  _.default.broadcast(channel, _.default.MEMBERS_CHANGE, data);
};

exports.changeMembers = changeMembers;

const addMember = (channel, data) => {
  _.default.broadcast(channel, _.default.MEMBER_ADD, data);
};

exports.addMember = addMember;

const delMember = (channel, data) => {
  _.default.broadcast(channel, _.default.MEMBER_DEL, data);
};

exports.delMember = delMember;

const updateMember = (channel, data) => {
  _.default.broadcast(channel, _.default.MEMBER_UPDATE, data);
};

exports.updateMember = updateMember;

const firstLineCall = (channel, data) => {
  _.default.broadcast(channel, _.default.FIRST_LINE_CALL, data);
};

exports.firstLineCall = firstLineCall;

const secondLineCall = (channel, data) => {
  _.default.broadcast(channel, _.default.SECOND_LINE_CALL, data);
};

exports.secondLineCall = secondLineCall;

const floorLineCall = (channel, data) => {
  _.default.broadcast(channel, _.default.FLOOR_LINE_CALL, data);
};

exports.floorLineCall = floorLineCall;

const loungeLineCall = (channel, data) => {
  _.default.broadcast(channel, _.default.LOUNGE_LINE_CALL, data);
};

exports.loungeLineCall = loungeLineCall;

const oratorLineCall = (channel, data) => {
  _.default.broadcast(channel, _.default.ORATOR_LINE_CALL, data);
};

exports.oratorLineCall = oratorLineCall;

const langbLineCall = (channel, data) => {
  _.default.broadcast(channel, _.default.LANGB_LINE_CALL, data);
};

exports.langbLineCall = langbLineCall;

const makeRelay = (channel, data) => {
  _.default.broadcast(channel, _.default.MAKE_RELAY, data);
};

exports.makeRelay = makeRelay;

const notify = (channel, data) => {
  _.default.broadcast(channel, _.default.NOTIFY, data);
};

exports.notify = notify;

const closeWindow = channel => {
  _.default.broadcast(channel, _.default.CLOSE_WINDOW);
};

exports.closeWindow = closeWindow;

const adjustments = (channel, data) => {
  _.default.broadcast(channel, _.default.ALL_ADJUSTMENTS, data);
};

exports.adjustments = adjustments;