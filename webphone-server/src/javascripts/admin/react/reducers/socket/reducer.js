import socket from '../../socket'

export const OPEN = 'SOCKET:OPEN'
export const CLOSE = 'SOCKET:CLOSE'
export const UPDATE = 'SOCKET:UPDATE'
export const RECONNECT = 'SOCKET:RECONNECT'

const initialState = {
  active: false,
  reconnecting: false,
  aborted: false
}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case OPEN:
      return { ...state, active: true, reconnecting: false, aborted: false }
    case CLOSE:
      return { ...state, active: false, reconnecting: false, aborted: true }
    case RECONNECT:
      return { ...state, active: false, reconnecting: true }
    default:
      return state
  }
}

export const open = () => ({ type: OPEN })

export const close = () => ({ type: CLOSE })

export const reconnect = () => ({ type: RECONNECT })

// Socket types
export const onOpen = () => ({
  type: socket.MESSAGE,
  payload: { event: socket.OPENED }
})

export const onClose = () => ({
  type: socket.MESSAGE,
  payload: { event: socket.CLOSED },
})

export const onMessage = data => ({
  type: socket.MESSAGE,
  payload: data,
})

export const onReconnect = () => ({
  type: socket.MESSAGE,
  payload: { event: socket.RECONNECTING }
})
