import fs from 'fs'
import yaml from 'js-yaml'
import * as path from 'path'
import confMap from '../shared/conf_map'
import app from './express'
import config from './config'

const rootPath = path.join(__dirname, '..')
const settingsPath = `${rootPath}/config/settings.yml`
const nodeEnv = process.env.NODE_ENV || 'development'

const configMode = process.env.CONFIG_MODE
config.rootPath = rootPath
global.rootPath = rootPath

const env = { [nodeEnv]: true }
export { app, env, confMap }
export default config
