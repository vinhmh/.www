import * as path from 'path'
import dotenv from 'dotenv'
dotenv.config()

const rootPath = path.join(__dirname, '..')
const base = (...args) => Reflect.apply(path.resolve, null, [rootPath, ...args])

export default {
  default: {
    wsUrl: process.env.wsUrl,
    wsTextchatNodeUrl: process.env.wsTextchatNodeUrl,
    httpsTextchatNodeUrl: process.env.httpsTextchatNodeUrl,
    paths: base,
    srcPath: base('src'),
    distPath: base('dist'),
    rootPath,
    publicPath: '/',
    compilerHashType: process.env.compilerHashType,
    compilerDevtool: process.env.compilerDevtool,
    manifestFilename: process.env.manifestFilename,
    serverPort: process.env.serverPort,
    janusEndpoint: process.env.janusEndpoint,
    voipHost: process.env.voipHost,
    echoTestRoom: process.env.echoTestRoom,
    textChatUrl: process.env.textChatUrl,
    bbbPageUrl: process.env.bbbPageUrl,
    sendLogs: process.env.sendLogs,
    webpackMode: process.env.webpackMode,
    sourceMap: process.env.sourceMap,
    stunIceUrl:  process.env.stunIceUrl,
    turnIceUrl:  process.env.turnIceUrl,
    turnUsername:  process.env.turnUsername,
    turnCredential: process.env.turnCredential
  },
  development: {
    webpackMode: process.env.devWebpackMode,
    sourceMap: process.env.devSourceMap,
  },
  docker: {
    wsUrl: process.env.dockerWsUrl,
    wsTextchatNodeUrl: process.env.dockerWsTextchatNodeUrl,
    publicPath: process.env.dockerPublicPath,
    janusEndpoint: process.env.dockerJanusEndpoint,
    textChatUrl: process.env.dockerTextChatUrl,
    bbbPageUrl: process.env.dockerBbbPageUrl
  },
  old_production: {
    wsUrl: process.env.oldprodWsUrl,
    publicPath: process.env.oldprodPublicPath,
    compilerHashType: process.env.oldprodCompilerHashType,
    compilerDevtool: process.env.oldprodCompilerDevtool,
    janusEndpoint: process.env.oldprodJanusEndpoint,
    voipHost: process.env.oldprodVoipHost,
    textChatUrl: process.env.oldprodTextChatUrl,
    bbbPageUrl: process.env.oldprodBbbPageUrl,
    sendLogs: process.env.oldprodSendLogs,
  },
  staging: {
    wsUrl: process.env.stagingWsUrl,
    wsTextchatNodeUrl: process.env.stagingWsTextchatNodeUrl,
    publicPath: process.env.stagingPublicPath,
    compilerHashType: process.env.stagingCompilerHashType,
    compilerDevtool: process.env.stagingCompilerDevtool,
    janusEndpoint: process.env.stagingJanusEndpoint,
    voipHost: process.env.stagingVoipHost,
    textChatUrl: process.env.stagingTextChatUrl,
    bbbPageUrl: process.env.stagingBbbPageUrl,
    sendLogs: process.env.stagingSendLogs
  },
  bench: {
    wsUrl:  process.env.benchWsUrl,
    publicPath: process.env.benchPublicPath,
    compilerHashType: process.env.benchCompilerHashType,
    compilerDevtool:  process.env.benchCompilerDevtool,
    janusEndpoint:  process.env.benchJanusEndpoint,
    voipHost: process.env.benchVoipHost,
    textChatUrl:  process.env.benchTextChatUrl,
    bbbPageUrl: process.env.benchBbbPageUrl,
    sendLogs: process.env.benchSendLogs
  },
  production: {
    wsUrl: process.env.prodWsUrl,
    publicPath: process.env.prodPublicPath,
    compilerHashType: process.env.prodCompilerHashType,
    compilerDevtool: process.env.prodCompilerDevtool,
    janusEndpoint: process.env.prodJanusEndpoint,
    voipHost: process.env.prodVoipHost,
    textChatUrl: process.env.prodTextChatUrl,
    bbbPageUrl: process.env.prodBbbPageUrl,
    sendLogs: process.env.prodSendLogs
  }
}
