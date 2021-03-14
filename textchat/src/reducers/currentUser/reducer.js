export const UPDATE = 'CURRENT_USER:UPDATE'
export const CHANGE = 'CURRENT_USER:CHANGE'

const initialState = {}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case CHANGE:
      return payload || initialState
    case UPDATE:
      return { ...state, ...payload }
    default:
      return state
  }
}

export const change = payload => ({ type: CHANGE, payload })

export const update = payload => ({ type: UPDATE, payload })
