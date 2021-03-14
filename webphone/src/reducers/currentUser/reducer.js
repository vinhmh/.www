export const ADD = 'CURRENT_USER:ADD'
export const UPDATE = 'CURRENT_USER:UPDATE'
export const CHANGE = 'CURRENT_USER:CHANGE'
export const SLOW_SPEAK = 'SLOW_SPEAK'
const initialState = { members: [], language: 'EN' }

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case ADD:
    case CHANGE:
      return {
        ...state,
        ...payload,
      }
    case UPDATE:
      return { ...state, ...helpers.deepCopy(payload) }
    case SLOW_SPEAK:
        return {...state, slowSpeak : false}
    default:
      return state
  }
}

export const add = (payload) => ({ type: ADD, payload })

export const currentUserUpdate = (payload) => ({ type: UPDATE, payload })

export const currentUserChange = (payload) => ({ type: CHANGE, payload })

export const changeCurrentUserLanguage = (languageCode) => ({ type: CHANGE, payload: { language: languageCode } })

export const showSlowSpeak = () => ({type: SLOW_SPEAK } )
