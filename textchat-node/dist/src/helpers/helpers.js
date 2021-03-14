"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateHash = exports.getId = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

var _config = _interopRequireDefault(require("../../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getId = object => object instanceof Object ? object.id : object;

exports.getId = getId;

const generateHash = string => _crypto.default.createHmac('sha256', _config.default.secretToken).update(string).digest('hex');

exports.generateHash = generateHash;