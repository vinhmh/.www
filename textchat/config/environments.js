import * as path from 'path'

const rootPath = path.join(__dirname, '..')
const base = (...args) => Reflect.apply(path.resolve, null, [rootPath, ...args])

export default {
  default: {
    wsUrl: 'ws://localhost:8082',
    paths: base,
    srcPath: base('src'),
    distPath: base('dist'),
    rootPath,
    publicPath: '/',
    compilerHashType: 'hash',
    compilerDevtool: 'cheap-module-source-map',
    manifestFilename: 'textchat.manifest.json',
    secretToken: 'a88e18a4622b084ef5cb0fd75c42b8c575a2d11e51bb383d9080ea338bc76c51f10d50614e29121601a493707be842a27fd03368bd43d1d280e911fd7599eee1',
    serverPort: 3002,
    langs: [
      { id: 'EN', title: 'English' },
      { id: 'DE', title: 'German' },
      { id: 'FR', title: 'French' },
      { id: 'ES', title: 'Spanish' },
      { id: 'PT', title: 'Portuguese' },
      { id: 'IT', title: 'Italian' },
      { id: 'NL', title: 'Dutch' },
      { id: 'PL', title: 'Polish' },
      { id: 'RU', title: 'Russian' }
    ],
    webpackMode: 'production',
  },
  development: {
    webpackMode: 'development',
  },
  staging: {
    wsUrl: 'wss://stg.meeting.ibridgepeople.net/textchat/ws',
    publicPath: '/textchat/',
    compilerHashType: 'chunkhash',
    compilerDevtool: false,
  },
  bench: {
    wsUrl: 'wss://meeting.ibridgepeople.fr/textchat/ws',
    publicPath: '/textchat/',
    compilerHashType: 'chunkhash',
    compilerDevtool: false,
  },
  production: {
    wsUrl: 'wss://webphone.ibridgepeople.fr/textchat/ws',
    publicPath: '/textchat/',
    compilerHashType: 'chunkhash',
    compilerDevtool: false,
  }
}
