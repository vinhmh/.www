"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _http = _interopRequireDefault(require("http"));

var _websocket = require("websocket");

var _axios = _interopRequireDefault(require("axios"));

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _multer = _interopRequireDefault(require("multer"));

var _multerS = _interopRequireDefault(require("multer-s3"));

var _config = _interopRequireDefault(require("../config"));

var _socket = _interopRequireDefault(require("../src/socket"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk.default.config.update({
  secretAccessKey: _config.default.bucketSecretAccessKey,
  accessKeyId: _config.default.bucketAccessKeyId
});

const spacesEndpoint = new _awsSdk.default.Endpoint(_config.default.bucketEndPoint);
const s3 = new _awsSdk.default.S3({
  endpoint: spacesEndpoint
});
const upload = (0, _multer.default)({
  storage: (0, _multerS.default)({
    s3: s3,
    bucket: _config.default.bucketName,
    acl: 'public-read',
    override: false,
    key: function (request, file, cb) {
      console.log(file);
      cb(null, file.originalname);
    }
  })
}).single('file');

const httpServer = _http.default.createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");

  if (request.method == 'POST' && request.url == '/upload') {
    upload(request, response, function (error) {
      if (error) {
        response.end("err");
      } else {
        const location = request.file.location;
        response.end(location);
      }
    });
  }
});

const {
  pid
} = process;
const TMP_DIR = `${_config.default.rootDir}/tmp/`;
const SOCKET_PATH = TMP_DIR + _config.default.socket_file;
const PID_PATH = TMP_DIR + _config.default.pidFile;
const server = {
  interface: _config.default.port,
  maxPackageSize: 5 * 1024 * 1024
};

if (!_fs.default.existsSync(TMP_DIR)) {
  _fs.default.mkdirSync(TMP_DIR);
}

if (_config.default.useSocket) {
  server.interface = SOCKET_PATH;

  if (_fs.default.existsSync(server.interface)) {
    _fs.default.unlinkSync(server.interface);
  }
}

_fs.default.writeFileSync(PID_PATH, pid.toString(), 'utf8');

const init = async () => {
  httpServer.listen(server.interface, () => {
    if (_config.default.useSocket) _fs.default.chmodSync(server.interface, '757');
    console.log(`${new Date()} Server is listening on ${server.interface}`);
  });
  httpServer.on('error', e => console.log(e));
  const wsServer = new _websocket.server({
    httpServer,
    maxReceivedFrameSize: server.maxPackageSize,
    maxReceivedMessageSize: server.maxPackageSize
  }); // wsServer.on('request', (request) => {
  //   const { origin } = request
  //   const allowedOrigin = config.allowedOrigin.some(url => url === origin)
  //   if (!allowedOrigin) {
  //     request.reject()
  //     console.log(`${new Date()} Connection from origin ${origin} rejected.`)
  //     return
  //   }
  //   const connection = request.accept(null, origin)
  //   const { query } = request.resourceURL
  //   Socket.create(connection, { query })
  // })

  wsServer.on('request', async request => {
    const {
      origin
    } = request;

    const allowedOrigin = _config.default.allowedOrigin.some(url => url === origin);

    let langsDeeplSupport;

    try {
      const url = `${_config.default.apiUrl2}?auth_key=${_config.default.authKey}`;
      const response = await _axios.default.post(url);
      langsDeeplSupport = response.data;
    } catch (error) {
      console.log('Error =>', error);
      langsDeeplSupport = _config.default.backupLangsDeeplSupport;
    } //


    if (!allowedOrigin) {
      request.reject();
      console.log(`${new Date()} Connection from origin ${origin} rejected.`);
      return;
    }

    const connection = request.accept(null, origin);
    const {
      query
    } = request.resourceURL;
    query.deepLSupports = langsDeeplSupport;

    _socket.default.create(connection, {
      query
    });
  });
};

init();