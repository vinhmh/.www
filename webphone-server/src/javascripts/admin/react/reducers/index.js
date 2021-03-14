import { combineReducers } from 'redux'
import adjustments from './adjustments/reducer'
import meetings from './meetings/reducer'
import users from './users/reducer'
import socket from './socket/reducer'

export default combineReducers({
  adjustments,
  meetings,
  users,
  socket,
})
