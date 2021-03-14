export const LOADED = 'APP:LOADED'
export const UPDATE = 'APP:UPDATE'
export const UPDATE_LANG = 'APP:UPDATE_LANG'

export const [LOGIN_SCREEN, CHAT_SCREEN] = ['LOGIN', 'CHAT']

const initialState = {
  lang: null,
  screen: LOGIN_SCREEN,
  sendTo: 'PUBLIC_CHANNEL',
  loading: false
}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case LOADED:
      return { ...state, screen: CHAT_SCREEN, loading: false }
    case UPDATE:
      return { ...state, ...payload }
    case UPDATE_LANG:
      return { ...state, lang: payload }
    default:
      return state
  }
}

export const loaded = () => ({ type: LOADED })

export const update = payload => ({ type: UPDATE, payload })

export const updateLang = payload => ({ type: UPDATE_LANG, payload })
