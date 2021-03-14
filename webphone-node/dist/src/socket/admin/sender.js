"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.informChangeOnMediaSettings = exports.bbbOff = exports.bbbOn = exports.adjustments = exports.removeUser = void 0;

var _admin = _interopRequireDefault(require("./admin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const removeUser = data => {
  _admin.default.broadcast(_admin.default.ADMIN_REMOVE_USER, data);
};

exports.removeUser = removeUser;

const adjustments = data => {
  _admin.default.broadcast(_admin.default.ALL_ADJUSTMENTS, data);
};

exports.adjustments = adjustments;

const bbbOn = data => {
  _admin.default.broadcast(_admin.default.BBB_ON, data);
};

exports.bbbOn = bbbOn;

const bbbOff = data => {
  _admin.default.broadcast(_admin.default.BBB_OFF, data);
};

exports.bbbOff = bbbOff;

const informChangeOnMediaSettings = (id, mediaSettings) => {
  _admin.default.broadcast(_admin.default.MEDIASETTINGS_CHANGE, {
    userId: id,
    mediaSettings
  });
};

exports.informChangeOnMediaSettings = informChangeOnMediaSettings;