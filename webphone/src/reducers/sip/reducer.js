export const ON_CONNECTION = 'SIP:ON_CONNECTION'
export const OFF_CONNECTION = 'SIP:OFF_CONNECTION'
export const READY = 'SIP:READY'
export const START = 'SIP:START'
export const STOP = 'SIP:STOP'

const initialState = {
  onConnection: false,
  ready: false,
  started: false
}

// Reducer
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ON_CONNECTION:
    case OFF_CONNECTION:
    case READY:
      return { ...state, ...payload }
    case START:
      return { ...state, started: true }
    case STOP:
      return { ...state, started: false }
    default:
      return state
  }
}

// Actions
export const start = () => ({ type: START, payload: { started: true } })

export const stop = () => ({ type: STOP, payload: { started: false } })

export const connect = (onConnection = true) => {
  const type = onConnection ? ON_CONNECTION : OFF_CONNECTION
  return { type, payload: { onConnection } }
}

export const ready = (ready = true) => ({ type: READY, payload: { ready } })

export const destroy = () => (dispatch) => {
  dispatch(stop())
  dispatch(connect(false))
  dispatch(ready(false))
}
