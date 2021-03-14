import settings from './environments'

const NODE_ENV = process.env.NODE_ENV || 'development'
const env = { [NODE_ENV]: true }

const configMode = process.env.CONFIG_MODE
var config = Object.assign(settings.default, settings[NODE_ENV])
if (typeof configMode !== 'undefined' && settings[configMode]) {
	config = Object.assign(config, settings[configMode])
}

export { env }
export default config
