import socket from '../../socket'

export const OPEN = 'SOCKET:OPEN'
export const CLOSE = 'SOCKET:CLOSE'
export const UPDATE = 'SOCKET:UPDATE'

const initialState = {
  active: false,
}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case OPEN:
      return { ...state, active: true }
    case CLOSE:
      return { ...state, active: false }
    case UPDATE:
      return { ...state, ...payload }
    default:
      return state
  }
}

export const open = () => ({ type: OPEN })

export const close = () => ({ type: CLOSE })

export const update = data => ({ type: UPDATE, payload: data })

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
