import { combineReducers } from 'redux'
import app from './app/reducer'
import currentUser from './currentUser/reducer'
import messages from './messages/reducer'
import socket from './socket/reducer'
import meeting from './meeting/reducer'


export default combineReducers({
  app,
  currentUser,
  messages,
  socket,
  meeting
})
