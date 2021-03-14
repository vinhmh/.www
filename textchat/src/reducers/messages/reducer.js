export const CHANGE = 'MEESSAGES:CHANGE'
export const UPDATE_USER = 'MEESSAGES:UPDATE_USER'
export const ADD = 'MEESSAGES:ADD'
const TECHNICAL_ASSIST_NAME = ' Ibp Techassist'

const initialState = []

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case CHANGE:
      return payload || initialState
    case UPDATE_USER:
      return state.map((m) => {
        if (m.user.id === payload.id) return { ...m, user: payload }
        return m
      })
    case ADD:
      if (window.parent) {
        if (payload.sendTo === 'PUBLIC_CHANNEL') {
          window.parent.postMessage('CHAT:NEW_MESSAGE', '*')
        } else {
          if(payload.meeting.type === 'PRIVATE') {
            console.log("payload", payload)
            if(payload.user.username == TECHNICAL_ASSIST_NAME) {
              window.parent.postMessage({ type: 'CHAT:NEW_PRIVATE_MESSAGE_TECHNICAL', payload },'*')
            } else {
              window.parent.postMessage({ type: 'CHAT:NEW_PRIVATE_MESSAGE', message: payload }, '*')
            }
          } else {
            window.parent.postMessage({ type: 'CHAT:NEW_GROUP_MESSAGE', message: payload }, '*')
          }
        }
      }
      return [...state, payload]
    default:
      return state
  }
}

export const change = (payload) => ({ type: CHANGE, payload })

export const updateUser = (payload) => ({ type: UPDATE_USER, payload })

export const add = (payload) => ({ type: ADD, payload })
