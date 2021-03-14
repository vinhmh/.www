import fs from 'fs'
import http from 'http'
import { server as WebSocketServer } from 'websocket'
import axios from 'axios'
import aws from 'aws-sdk'
import multer from 'multer'
import multerS3 from 'multer-s3'
import config from '../config'
import Socket from '../src/socket'

aws.config.update({
  secretAccessKey: config.bucketSecretAccessKey,
  accessKeyId: config.bucketAccessKeyId
})
const spacesEndpoint = new aws.Endpoint(config.bucketEndPoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.bucketName,
    acl: 'public-read',
    override: false,
    key: function (request, file, cb) {
      console.log(file);
      cb(null, file.originalname);
    }
  })
}).single('file')
const httpServer = http.createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*")
  if(request.method == 'POST' && request.url == '/upload'){
    upload(request, response, function (error) {
      if (error) {
        response.end("err")
      }
      else {
        const location = request.file.location
        response.end(location)
      }
    });
  }

});



const { pid } = process
const TMP_DIR = `${config.rootDir}/tmp/`
const SOCKET_PATH = TMP_DIR + config.socket_file
const PID_PATH = TMP_DIR + config.pidFile

const server = {
  interface: config.port,
  maxPackageSize: 5 * 1024 * 1024,
}

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR)
}

if (config.useSocket) {
  server.interface = SOCKET_PATH
  if (fs.existsSync(server.interface)) {
    fs.unlinkSync(server.interface)
  }
}

fs.writeFileSync(PID_PATH, pid.toString(), 'utf8')

const init = async () => {
  httpServer.listen(server.interface, () => {
    if (config.useSocket) fs.chmodSync(server.interface, '757')
    console.log(`${new Date()} Server is listening on ${server.interface}`)
  })

  httpServer.on('error', e => console.log(e))

  const wsServer = new WebSocketServer({
    httpServer,
    maxReceivedFrameSize: server.maxPackageSize,
    maxReceivedMessageSize: server.maxPackageSize,
  })

  // wsServer.on('request', (request) => {
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
  wsServer.on('request', async (request) => {
    const { origin } = request
    const allowedOrigin = config.allowedOrigin.some(url => url === origin)
    let langsDeeplSupport
    try {
      const url = `${config.apiUrl2}?auth_key=${config.authKey}`
      const response = await axios.post(url)
      langsDeeplSupport = response.data
    } catch (error) {
      console.log('Error =>', error)
      langsDeeplSupport = config.backupLangsDeeplSupport
    }
    //
    if (!allowedOrigin) {
      request.reject()
      console.log(`${new Date()} Connection from origin ${origin} rejected.`)
      return
    }
    const connection = request.accept(null, origin)
    const { query } = request.resourceURL
    query.deepLSupports = langsDeeplSupport
    Socket.create(connection, { query })
  })
}

init()
