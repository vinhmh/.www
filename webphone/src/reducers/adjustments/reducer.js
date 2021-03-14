export const CHANGE = 'ADJUSTMENTS:CHANGE'

const initialState = {}

export default function (adjustments = initialState, { type, payload }) {
  const state = helpers.deepCopy(adjustments)

  switch (type) {
    case CHANGE:
      return payload
    default:
      return state
  }
}

export const change = payload => ({
  type: CHANGE,
  payload,
})
