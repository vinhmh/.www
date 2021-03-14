export const DISPLAY_TEXTCHAT = 'APP:DISPLAY_TEXTCHAT'
export const LOADED = 'APP:LOADED'
export const TOGGLE_DRAWER = 'APP:TOGGLE_DRAWER'
export const SET_LOADING = 'APP:SET_LOADING'
export const SET_ERROR = 'APP:SET_ERROR'
export const UPDATE_SWITCH_CHAT = 'APP:UPDATE_SWITCH_CHAT'
export const SCROLL_TO_CHAT = 'APP:SCROLL_TO_CHAT'
export const SET_MUTE = 'APP:SET_MUTE'

const initialState = {
  displayTextchat: false,
  drawer: null,
  loading: false,
  error: null,
  message: '',
  switchChat: true,
  scrollToChat: false,
  appMuted: false
}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case DISPLAY_TEXTCHAT:
      return { ...state, displayTextchat: payload }
    case LOADED:
      return { ...state}
    case TOGGLE_DRAWER:
      return { ...state, drawer: payload}
    case SET_LOADING: 
      return {...state, loading: payload.status, message: payload.message}
    case SET_ERROR: 
      return {...state, error: payload}
    case UPDATE_SWITCH_CHAT: 
      return {...state, switchChat: payload != null ? payload : !state.switchChat}
    case SCROLL_TO_CHAT:
      return {...state, scrollToChat: !state.scrollToChat}
    case SET_MUTE:
      return {...state, appMuted: payload}
    default:
      return state
  }
}

export const loaded = () => ({ type: LOADED })

export const displayTextChat = (payload = true) => ({ type: DISPLAY_TEXTCHAT, payload })

export const toggleDrawer = (payload = null) => ({ type: TOGGLE_DRAWER, payload })

export const setLoading = (payload) => ({type: SET_LOADING, payload})

export const setError = (payload) => ({type: SET_ERROR, payload}) 

export const updateSwitchChat = (payload = null) => ({type: UPDATE_SWITCH_CHAT, payload})

export const scrollToChat = () => ({type: SCROLL_TO_CHAT})

export const setMute = (payload) => ({type: SET_MUTE, payload})