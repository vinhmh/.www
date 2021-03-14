"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = _interopRequireDefault(require("../socket"));

var _handler = _interopRequireDefault(require("./handler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// import axios from 'axios'
// import config from '../../../config'
class Client extends _socket.default {
  constructor(props) {
    super(props);
    this.handler = _handler.default;
  }

  // {channel_name: Set [ instanceId ]}
  static add(connection, queryString = {}) {
    const {
      webphoneUserId,
      languagesConfig,
      deepLSupports
    } = queryString;
    connection.webphoneUserId = webphoneUserId;
    connection.languagesConfig = languagesConfig;
    connection.deepLSupports = deepLSupports;
    const socket = new Client(connection);
    Client.all.push(socket);
    return socket;
  }

} // import axios from 'axios'
// import Socket from '../socket'
// import handler from './handler'
// import config from '../../../config'
// export default class Client extends Socket {  
//   constructor(props) {
//     super(props)
//     this.handler = handler
//   }
//   static all = [] // array of all socket instances
//   static channels = {} // {channel_name: Set [ instanceId ]}
//   static async add(connection, queryString = {}) {
//     const { webphoneUserId, meetingID, role } = queryString
//     connection.webphoneUserId = webphoneUserId
//     const { webphoneSecretToken } = config
//     const params = { meetingID, secretToken: webphoneSecretToken }
//     let languagesSupport
//     try {
//       const response = await axios.get(
//         `${config.webphoneServer}/getMeetingData`,
//         { params }
//       )
//       languagesSupport = response.data.meeting.conferences.filter(
//         (c) => role !== 'regular' || c.accessible
//       ).map(c => c.code)
//     } catch (error) {
//       languagesSupport = null
//     }
//     connection.languagesSupport = languagesSupport
//     const socket = new Client(connection)
//     Client.all.push(socket)
//     return socket
//   }
// }


exports.default = Client;

_defineProperty(Client, "all", []);

_defineProperty(Client, "channels", {});