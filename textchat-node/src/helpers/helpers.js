import crypto from 'crypto'
import config from '../../config'

export const getId = object => (object instanceof Object ? object.id : object)
export const generateHash = string => crypto.createHmac('sha256', config.secretToken).update(string).digest('hex')
