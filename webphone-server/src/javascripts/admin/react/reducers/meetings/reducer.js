export const CHANGE = 'MEETINGS:CHANGE'

const initialState = {}

export default function (meetings = initialState, { type, payload }) {
  const state = deepCopy(meetings)

  switch (type) {
    case CHANGE:
      return payload
    default:
      return state
  }
}

export const load = payload => ({ type: CHANGE, payload })
