/* eslint default-case: 0 */
import socket from '../socket'
import * as App from '../reducers/app'
import * as CurrentUser from '../reducers/currentUser'
import * as Messages from '../reducers/messages'
import * as Meeting from '../reducers/meeting'


export default ({ dispatch }) => next => action => {
  // Process only SOCKET:MESSAGE actions
  if (action.type !== socket.MESSAGE) return next(action)

  const { data, event } = action.payload
  switch (event) {
    case socket.MEETING_ADD:
      dispatch(Meeting.add(data))
      break
    case socket.USER_CHANGE:
      dispatch(CurrentUser.change(data))
      break
    case socket.MESSAGES_CHANGE:
      dispatch(Messages.change(data))
      break
    case socket.MESSAGES_UPDATE_USER:
      dispatch(Messages.updateUser(data))
      break
    case socket.APP_LOADED:
      dispatch(App.loaded())
      break
    case socket.MESSAGES_ADD:
      dispatch(Messages.add(data))
      break
  }

  socket.emit(event, data)
}
