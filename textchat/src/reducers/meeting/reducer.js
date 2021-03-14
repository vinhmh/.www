export const ADD = 'MEETING:ADD'

const initialState = {
  meetings: []
}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case ADD:
      if (window.parent) {
        window.parent.postMessage({ type: 'CHAT:NEW_MEETING', message: payload }, '*')
    } 
      return { ...state, meetings: [...state.meetings, payload] }
    default:
      return state
  }
}

export const add = (data) => ({ type: ADD, payload: data })
