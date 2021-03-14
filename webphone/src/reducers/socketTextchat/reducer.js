import socket from '../../socket'

export const OPENED = 'SOCKET:OPENED'
export const CLOSED = 'SOCKET:CLOSED'
export const UPDATE = 'SOCKET:UPDATE'

const initialState = {
  active: false,
}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case OPENED:
      return { ...state, active: true }
    case CLOSED:
      return { ...state, active: false }
    case UPDATE:
      return { ...state, ...payload }
    default:
      return state
  }
}

export const onOpen = payload => ({ type: OPENED, payload })

export const onClose = () => ({ type: CLOSED })

export const update = payload => ({ type: UPDATE, payload })

// Socket types
export const onMessage = data => ({
  type: socket.MESSAGE,
  payload: data,
})
