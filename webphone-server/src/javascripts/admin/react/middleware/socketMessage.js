/* eslint default-case: 0 */
import * as Socket from '../reducers/socket'
import * as Adjustments from '../reducers/adjustments'
import * as Users from '../reducers/users'
import socket from '../socket'

export default ({ dispatch }) => next => action => {
  // Process only SOCKET:MESSAGE actions
  if (action.type !== socket.MESSAGE) return next(action)

  const { data, event } = action.payload

  switch (event) {
    case socket.OPENED:
      dispatch(Socket.open())
      break
    case socket.CLOSED:
      dispatch(Users.change([]))
      dispatch(Socket.close())
      break
    case socket.RECONNECTING:
      dispatch(Socket.reconnect())
      break;
    case socket.ALL_USERS:
      // console.log(">>>", data)

      // var newData = []
      // if (data && data.length > 0) {
      //   const user = data[0]
      //   newData = []
      //   for (var i = 0; i < 30; i++) {
      //     user.displayName = `user_${i}`
      //     user.usernameInput = `user_${i}`
      //     user.username = `fixeduser_${i}`
      //     user.id = `${i}`
      //     newData.push({ ...user });
      //   }
      // } else {
      //   newData = data;
      // }
      dispatch(Users.change(data))
      break
    case socket.ALL_CLIENTS:
      dispatch(Clients.change(data))
      break
    case socket.ALL_ADJUSTMENTS:
      dispatch(Adjustments.change(data))
      break
    case socket.BBB_ON:
      console.log(data)
      dispatch(Users.toggleBBB(data, true))
      break
    case socket.BBB_OFF:
      console.log(data)
      dispatch(Users.toggleBBB(data, false))
      break
    case socket.NEW_USER:
      dispatch(Users.add(data))
      break
    case socket.ADMIN_SET_USER_STATE:
      dispatch(Users.updateUserState(data))
      break
    case socket.PROFILE_UPDATE:
      dispatch(Users.update(data))
      break
    case socket.ADMIN_REMOVE_USER:
      dispatch(Users.remove(data))
      break
    case socket.MEDIASETTINGS_CHANGE:
      dispatch(Users.updateMediaSettings(data))
  }
  socket.emit(event, data)
}
