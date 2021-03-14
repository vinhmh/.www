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

_envSmart.default.load();

const rootDir = path.join(__dirname, '..');
var _default = {
  default: {
    pidFile: 'textchat.pid',
    port: 8082,
    useSocket: false,
    rootDir,
    secretToken: 'd33672be2b0a5319dea3d127304311a6f5cb3e6de7cf8bc9fc7677bc082fc43204cfae3ff120f002ea13c344e227dd6f25f6d5b7d10a0cf9b164c08806490008',
    webphoneSecretToken: 'd371dbef7aa52d1f70437c9a20371615c6788c2e4dde5cb6a41e3ff4e1cdd05f8ca3f586bb19aad8a31d442f6ecc38551c49ea7fcf2c06b459921b7b8733b384',
    allowedOrigin: [''],
    apiUrl: 'https://api.deepl.com/v2/translate',
    apiUrl2: 'https://api.deepl.com/v2/languages',
    authKey: '7f2e5b30-75ab-d220-7475-d3c257127013',
    translateLangs: ['EN', 'DE', 'ES', 'FR', 'PT', 'IT', 'NL', 'PL', 'RU'],
    webphoneServer: 'http://localhost:3001',
    techAssistantUser: '_ibp_techassist',
    bucketSecretAccessKey: 'sTmAWXcPpf7izRsQUvZ3r7V39em55z5CIiqgOxHGds4',
    bucketAccessKeyId: 'ZAWLEL6XWXH2GOH64HW4',
    bucketEndPoint: 'nyc3.digitaloceanspaces.com',
    bucketName: 'opentechiz-test-documents'
  },
  development: {
    allowedOrigin: ['http://localhost:3000', 'http://localhost:3002']
  },
  docker: {
    useSocket: true,
    socket_file: 'textchat.sock',
    allowedOrigin: ['https://webphone.tech'],
    webphoneServer: 'https://webphone.tech'
  },
  staging: {
    useSocket: true,
    socket_file: 'textchat.sock',
    allowedOrigin: ['https://stg.meeting.ibridgepeople.net'],
    webphoneServer: 'https://stg.meeting.ibridgepeople.net'
  },
  bench: {
    useSocket: true,
    socket_file: 'textchat.sock',
    allowedOrigin: ['https://meeting.ibridgepeople.fr'],
    webphoneServer: 'https://meeting.ibridgepeople.fr'
  },
  production: {
    useSocket: true,
    socket_file: 'textchat.sock',
    allowedOrigin: ['https://webphone.ibridgepeople.fr'],
    webphoneServer: 'https://webphone.ibridgepeople.fr'
  },
  digitalOcean: {
    secretAccessKey: 'VomUCSVELm4UzufItwPykx0w7SPcL6n7m4vUpfr/eF8',
    accessKeyId: 'YOLBDSNTP4BEX7VLFTIT'
  }
};
exports.default = _default;