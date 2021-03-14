import { combineReducers } from 'redux'
import adjustments from './adjustments/reducer'
import app from './app/reducer'
import currentUser from './currentUser/reducer'
import debugInfo from './debugInfo/reducer'
import mediaSettings from './mediaSettings/reducer'
import members from './members/reducer'
import notice from './notice/reducer'
import sip from './sip/reducer'
import socket from './socket/reducer'
import socketTextchat from './socketTextchat/reducer'
import splashScreen from './splashScreen/reducer'
import messages from './messages/reducer'
import meeting from './meeting/reducer'
import membersOff from './membersOff/reducer'
import msgNotification from './msgNotification/reducer'
import textchatApp from './textchatApp/reducer'
import moderators from './moderators/reducer'


export default combineReducers({  
  adjustments,
  app,
  currentUser,
  debugInfo,
  mediaSettings,
  members,
  notice,
  sip,
  socket,
  socketTextchat,
  splashScreen,
  meeting,
  messages,
  membersOff,
  msgNotification,
  textchatApp,
  moderators
})
