import Admin from './admin'

export const removeUser = (data) => {
  Admin.broadcast(Admin.ADMIN_REMOVE_USER, data)
}

export const adjustments = (data) => {
  Admin.broadcast(Admin.ALL_ADJUSTMENTS, data)
}

export const bbbOn = (data) => {
  Admin.broadcast(Admin.BBB_ON, data)
}

export const bbbOff = (data) => {
  Admin.broadcast(Admin.BBB_OFF, data)
}

export const informChangeOnMediaSettings = (id, mediaSettings) => {
  Admin.broadcast(Admin.MEDIASETTINGS_CHANGE, { userId: id, mediaSettings })
}
