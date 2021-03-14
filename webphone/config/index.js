import settings from './environments'

const node_env = process.env.NODE_ENV || 'development'
const env = { [node_env]: true }
const configMode = process.env.CONFIG_MODE
var config = Object.assign(settings.default, settings[node_env])
if (typeof configMode !== 'undefined' && settings[configMode]) {
	config = Object.assign(config, settings[configMode])
}
export { env }
export default config