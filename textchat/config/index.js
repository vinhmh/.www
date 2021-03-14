import settings from './environments'

const node_env = process.env.NODE_ENV || 'development'
const env = { [node_env]: true }
const config = Object.assign(settings.default, settings[node_env])

export { env }
export default config
