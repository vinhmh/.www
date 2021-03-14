export const ADD = 'USERS:ADD'
export const UPDATE = 'USERS:UPDATE'
export const CHANGE = 'USERS:CHANGE'
export const REMOVE = 'USERS:REMOVE'
export const UPDATE_USER_STATE = 'USERS:UPDATE_USER_STATE'
export const UPDATE_MEDIA_SETTINGS = 'USERS:UPDATE_MEDIA_SETTINGS'
export const TOGGLE_BBB = 'USERS:TOGGLE_BBB'

const initialState = []

export default function (users = initialState, { type, payload }) {
  const state = deepCopy(users)

  switch (type) {
    case ADD:

      return [...state, payload]
    case UPDATE: {
      const index = state.findIndex(user => user.id === payload.id)
      if (index !== -1) {
        const user = state[index]
        state[index] = { ...user, ...payload }
      }
      return state
    }
    case CHANGE:
      return payload
    case REMOVE: {
      const itemIndex = state.findIndex(u => u.id === payload)
      if (itemIndex > -1) state.splice(itemIndex, 1)
      return state
    }
    case TOGGLE_BBB: {
      const { userId, status } = payload
      const index = state.findIndex(u => u.id === userId)
      if (index !== -1) {
        const user = state[index]
        state[index] = { ...user, bbbStatus: status }
      }
      return state
    }
    case UPDATE_USER_STATE: {
      const { userId, userState } = payload
      const index = state.findIndex(u => u.id === userId)
      if (index !== -1) {
        const user = state[index]
        state[index] = { ...user, userState }
      }
      return state
    }
    case UPDATE_MEDIA_SETTINGS: {
      const { userId, mediaSettings } = payload
      const index = state.findIndex(u => u.id === userId)
      if (index !== -1) {
        const user = state[index]
        user.userState.mediaSettings = Object.assign({}, mediaSettings)
        state[index] = user
      }
      return state
    }
    default:
      return state
  }
}

export const add = payload => ({
  type: ADD,
  payload,
})

export const update = payload => ({
  type: UPDATE,
  payload,
})

export const toggleBBB = (payload, status) => ({
  type: TOGGLE_BBB,
  payload: { ...payload, status },
})

export const change = payload => ({
  type: CHANGE,
  payload,
})

export const remove = payload => ({
  type: REMOVE,
  payload,
})

export const updateUserState = payload => ({
  type: UPDATE_USER_STATE,
  payload,
})

export const updateMediaSettings = payload => ({
  type: UPDATE_MEDIA_SETTINGS,
  payload,
})
