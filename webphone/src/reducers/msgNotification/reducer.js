export const REMOVE = 'MEESSAGES_NOTI:REMOVE'
export const ADD = 'MEESSAGES_NOTI:ADD'

export const types = {
  new_message: 1,
  added_to_a_meeting: 2,
}

const initialState = []

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case ADD:
      if (state.length == 3) state.shift();
      return [...state, payload]
    case REMOVE:
      const stateClone = [...state]
      const newState = stateClone.filter((m) => m.notiId != payload)
      return [...newState]
    default:
      return state
  }
}

export const remove = (payload) => ({ type: REMOVE, payload })

export const add = (payload) => ({ type: ADD, payload })
