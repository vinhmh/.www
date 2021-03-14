import dotenv from 'dotenv'
dotenv.config();
const config = {
  appUrl: process.env.appUrl,
  webphoneUrl: process.env.webphoneUrl,
  wsUrl: process.env.wsUrl,
  host: process.env.host,
  bbb_secret: process.env.bbb_secret,
  voipHost: process.env.voipHost,
  outputPath: process.env.outputPath,
  compilerHashType: process.env.compilerHashType,
  compilerDevtool: process.env.compilerDevtool,
  webpackMode: process.env.webpackMode,
  minimizeAssets: process.env.minimizeAssets,
  publicPath: process.env.publicPath,
  manifestFilename: process.env.manifestFilename,
  secretToken: process.env.secretToken,
  webphoneCheckUrl: process.env.webphoneCheckUrl,
  browserMinimalVersion: {
    Chrome: 80,
    Safari: 13,
    Firefox: 78,
    Edge: 80,
  },
  systemMinimalVersion: {
    MacOS: 10.13,
    iOS: 13.0,
    Android: 9,
    Windows: 7,
  },
  terms: {
    regularTerms: 'https://en.ibridgepeople.com/utilisation',
    interpreterTerms: 'https://en.ibridgepeople.com/utilisation',
    moderatorTerms: 'https://en.ibridgepeople.com/utilisation',
  },
}

export default {
  ...config,
  ...(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ? {
    compilerHashType: 'chunkhash',
    compilerDevtool: false,
    webpackMode: 'production',
    minimizeAssets: true,
  } : {}),
}
