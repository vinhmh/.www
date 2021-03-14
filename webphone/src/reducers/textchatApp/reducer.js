export const UPDATE_DEEPL_LANGS_SUPPORT = 'TEXTCHAT_APP:UPDATE_DEEPL_LANGS_SUPPORT'
export const UPDATE_MSG_UNREAD = 'TEXTCHAT_APP:UPDATE_MSG_UNREAD'
export const SCROLL_TO_BOTTOM_CHAT = 'TEXTCHAT_APP:SCROLL_TO_BOTTOM_CHAT'
export const CLEAR_MSG_UNREAD = 'TEXTCHAT_APP:CLEAR_MSG_UNREAD'

const initialState = {
  deeplLangsSupport: [],
  msgUnreadCounter: 0,
  scrollToBottomChat: false,
}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case UPDATE_DEEPL_LANGS_SUPPORT:
      return { ...state, deeplLangsSupport: payload }
    case UPDATE_MSG_UNREAD:
      return { ...state, msgUnreadCounter: (state.msgUnreadCounter + payload) > 0 ? state.msgUnreadCounter + payload : 0 }
    case CLEAR_MSG_UNREAD:
      return { ...state, msgUnreadCounter: 0 }
    case SCROLL_TO_BOTTOM_CHAT:
      return { ...state, scrollToBottomChat: !state.scrollToBottomChat }
    default:
      return state
  }
}

export const updateDeeplLangsSupport = (payload) => ({ type: UPDATE_DEEPL_LANGS_SUPPORT, payload })

export const updateMsgUnread = (payload) => ({ type: UPDATE_MSG_UNREAD, payload })

export const clearMsgUnread = () => ({ type: CLEAR_MSG_UNREAD})

export const scrollToBottomChat = () => ({ type: SCROLL_TO_BOTTOM_CHAT })
