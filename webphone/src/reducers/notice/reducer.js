export const SET_MESSAGE = 'NOTICE_SET_MESSAGE'

const initialState = {
  message: null
}

// Reducer
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case SET_MESSAGE: {
      return { message: payload }
    }
    default:
      return state
  }
}

// Actions
export const show = payload => ({ type: SET_MESSAGE, payload })

export const hide = () => ({ type: SET_MESSAGE, payload: null })
