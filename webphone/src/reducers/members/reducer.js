export const MEMBER_ADD = 'MEMBER_ADD'
export const MEMBER_DEL = 'MEMBER_DEL'
export const MEMBER_UPDATE = 'MEMBER_UPDATE'
export const MEMBERS_CHANGE = 'MEMBERS_CHANGE'

const updateUserMembers = (payload, state) => {
  const userMemberIds = payload.user.members
  userMemberIds.forEach((id) => {
    const index = state.findIndex(member => member.id === id)
    if (index !== -1) state[index].user = payload.user
  })
  return state
}

const initialState = []

export default function (members = initialState, { type, payload }) {
  let state = helpers.deepCopy(members)

  switch (type) {
    case MEMBER_ADD: {
      state = updateUserMembers(payload, state)
      state.push(payload)
      return state
    }
    case MEMBER_DEL: {
      const index = state.findIndex(member => member.id === payload.id)
      if (index !== -1) state.splice(index, 1)
      state = updateUserMembers(payload, state)
      return state
    }
    case MEMBER_UPDATE: {
      const index = state.findIndex(member => member.id === payload.id)
      if (index !== -1) state[index] = payload
      return state
    }
    case MEMBERS_CHANGE: {
      if (!payload) return initialState
      return payload
    }
    default:
      return state
  }
}

export const membersChange = payload => ({
  type: MEMBERS_CHANGE,
  payload,
})

export const memberAdd = payload => ({
  type: MEMBER_ADD,
  payload,
})

export const memberDel = payload => ({
  type: MEMBER_DEL,
  payload,
})

export const memberUpdate = payload => ({
  type: MEMBER_UPDATE,
  payload,
})
