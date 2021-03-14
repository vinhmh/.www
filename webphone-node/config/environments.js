// TODO CamelCase
import * as path from 'path'
import env from 'env-smart';
env.load();

const rootDir = path.join(__dirname, '..')
export default {
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

}
