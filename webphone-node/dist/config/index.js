"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.env = void 0;

var _environments = _interopRequireDefault(require("./environments"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NODE_ENV = process.env.NODE_ENV || 'development';
const env = {
  [NODE_ENV]: true
};
exports.env = env;
const configMode = process.env.CONFIG_MODE;
var config = Object.assign(_environments.default.default, _environments.default[NODE_ENV]);

if (typeof configMode !== 'undefined' && _environments.default[configMode]) {
  config = Object.assign(config, _environments.default[configMode]);
}

var _default = config;
exports.default = _default;