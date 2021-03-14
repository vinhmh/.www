"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var path = _interopRequireWildcard(require("path"));

var _envSmart = _interopRequireDefault(require("env-smart"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// TODO CamelCase
_envSmart.default.load();

const rootDir = path.join(__dirname, '..');
var _default = {
  default: {
    pid_file: process.env.pidFile,
    port: process.env.port,
    eslDebug: process.env.eslDebug,
    use_socket: process.env.useSocket,
    voipHost: process.env.voipHost,
    voip_password: process.env.voipPassword,
    voip_port: process.env.voipPort,
    rootDir,
    secretToken: process.env.secretToken,
    allowedOrigin: process.env.allowedOrigin,
    switcherPassword: process.env.switcherPassword,
    webphoneServer: process.env.webphoneServer,
    techAssistantUser: process.env.techAssistantUser,
    defaultVoipPassword: process.env.defaultVoipPassword
  },
  development: {
    allowedOrigin: process.env.devAllowedOrigin
  },
  docker: {
    use_socket: process.env.dockerUse_socket,
    socket_file: process.env.dockerSocket_file,
    webphoneServer: process.env.dockerWebphoneServer,
    allowedOrigin: process.env.dockerAllowedOrigin
  },
  staging: {
    use_socket: process.env.stagingUseSocket,
    socket_file: process.env.stagingSocketFile,
    voipHost: process.env.stagingVoipHost,
    voip_password: process.env.stagingVoip_password,
    webphoneServer: process.env.stagingWebphoneServer,
    allowedOrigin: process.env.stagingAllowedOrigin
  },
  bench: {
    use_socket: process.env.benchUse_socket,
    socket_file: process.env.benchSocket_file,
    voipHost: process.env.benchVoipHost,
    voip_password: process.env.benchVoip_password,
    webphoneServer: process.env.benchWebphoneServer,
    allowedOrigin: process.env.benchAllowedOrigin
  },
  production: {
    use_socket: process.env.prodUse_socket,
    socket_file: process.env.prodSocket_file,
    voipHost: process.env.prodVoipHost,
    voip_password: process.env.prodVoip_password,
    webphoneServer: process.env.prodWebphoneServer,
    allowedOrigin: process.env.prodAllowedOrigin
  }
};
exports.default = _default;