"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _http = _interopRequireDefault(require("http"));

var _esl = _interopRequireWildcard(require("modesl"));

var _websocket = require("websocket");

var _config = _interopRequireDefault(require("../config"));

var _esl2 = _interopRequireDefault(require("../src/esl"));

var _socket = _interopRequireDefault(require("../src/socket"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const httpServer = _http.default.createServer();

const {
  pid
} = process;
const TMP_DIR = `${_config.default.rootDir}/tmp/`;
const SOCKET_PATH = TMP_DIR + _config.default.socket_file;
const PID_PATH = TMP_DIR + _config.default.pid_file;
const server = {
  interface: _config.default.port,
  maxPackageSize: 5 * 1024 * 1024
};

if (!_fs.default.existsSync(TMP_DIR)) {
  _fs.default.mkdirSync(TMP_DIR);
}

if (_config.default.use_socket) {
  server.interface = SOCKET_PATH;

  if (_fs.default.existsSync(server.interface)) {
    _fs.default.unlinkSync(server.interface);
  }
}

_fs.default.writeFileSync(PID_PATH, pid.toString(), 'utf8');

let freeswitchTimeout = null;

const freeswitchConnect = () => {
  const connection = new _esl.Connection(_config.default.voipHost, _config.default.voip_port, _config.default.voip_password);
  connection.on('error', err => {
    console.log('Error during connection to Freeswitch: \n', err);
    console.log('Reconnection in 5 sec...');
    _esl2.default.connection = null;
    freeswitchTimeout = setTimeout(freeswitchConnect, 5000);
  }).on('esl::connect', () => {
    console.log('Connecting to Freeswitch...');
  }).on('esl::ready', () => {
    clearTimeout(freeswitchTimeout);
    console.log('Connected to Freeswitch');

    _esl2.default.init(connection);
  }).on('esl::end', () => {
    console.log('Connection to Freeswitch is closed, reconnecting in 5 sec...');
    _esl2.default.connection = null;
    freeswitchTimeout = setTimeout(freeswitchConnect, 5000);
  });
};

const init = () => {
  freeswitchConnect();
  httpServer.listen(server.interface, () => {
    if (_config.default.use_socket) _fs.default.chmodSync(server.interface, '757');
    console.log(`${new Date()} Server is listening on ${server.interface}`);
  });
  httpServer.on('error', e => {
    console.log(e);
  });
  const wsServer = new _websocket.server({
    httpServer,
    maxReceivedFrameSize: server.maxPackageSize,
    maxReceivedMessageSize: server.maxPackageSize
  });
  wsServer.on('request', request => {
    const {
      origin
    } = request;
    console.log("========");
    console.log(origin); // const allowedOrigin = config.allowedOrigin.some(url => url === origin)
    // if (!allowedOrigin || !Esl.connection) {
    //   request.reject()
    //   console.log(`${new Date()} Connection from origin ${origin} rejected.`)
    //   return
    // }

    const connection = request.accept(null, origin);
    const {
      query
    } = request.resourceURL;

    _socket.default.create(connection, {
      query
    });
  });
};

init();