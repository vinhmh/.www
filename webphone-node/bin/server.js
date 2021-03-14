import fs from 'fs'
import http from 'http'
import * as _esl from 'modesl'
import { server as WebSocketServer } from 'websocket'
import config from '../config'
import Esl from '../src/esl'
import Socket from '../src/socket'

const httpServer = http.createServer()
const { pid } = process
const TMP_DIR = `${config.rootDir}/tmp/`
const SOCKET_PATH = TMP_DIR + config.socket_file
const PID_PATH = TMP_DIR + config.pid_file

const server = {
  interface: config.port,
  maxPackageSize: 5 * 1024 * 1024,
}

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR)
}

if (config.use_socket) {
  server.interface = SOCKET_PATH
  if (fs.existsSync(server.interface)) {
    fs.unlinkSync(server.interface)
  }
}

fs.writeFileSync(PID_PATH, pid.toString(), 'utf8')

let freeswitchTimeout = null

const freeswitchConnect = () => {
  const connection = new _esl.Connection(config.voipHost, config.voip_port, config.voip_password)

  connection
    .on('error', err => {
      console.log('Error during connection to Freeswitch: \n', err)
      console.log('Reconnection in 5 sec...')
      Esl.connection = null
      freeswitchTimeout = setTimeout(freeswitchConnect, 5000)
    })
    .on('esl::connect', () => {
      console.log('Connecting to Freeswitch...')
    })
    .on('esl::ready', () => {
      clearTimeout(freeswitchTimeout)
      console.log('Connected to Freeswitch')
      Esl.init(connection)
    })
    .on('esl::end', () => {
      console.log('Connection to Freeswitch is closed, reconnecting in 5 sec...')
      Esl.connection = null
      freeswitchTimeout = setTimeout(freeswitchConnect, 5000)
    })
}

const init = () => {
  freeswitchConnect()

  httpServer.listen(server.interface, () => {
    if (config.use_socket) fs.chmodSync(server.interface, '757')
    console.log(`${new Date()} Server is listening on ${server.interface}`)
  })

  httpServer.on('error', (e) => {
    console.log(e)
  })

  const wsServer = new WebSocketServer({
    httpServer,
    maxReceivedFrameSize: server.maxPackageSize,
    maxReceivedMessageSize: server.maxPackageSize,
  })

  wsServer.on('request', (request) => {
    const { origin } = request
    console.log("========")
    console.log(origin)
    // const allowedOrigin = config.allowedOrigin.some(url => url === origin)

    // if (!allowedOrigin || !Esl.connection) {
    //   request.reject()
    //   console.log(`${new Date()} Connection from origin ${origin} rejected.`)
    //   return
    // }

    const connection = request.accept(null, origin)
    const { query } = request.resourceURL

    Socket.create(connection, { query })
  })
}

init()
