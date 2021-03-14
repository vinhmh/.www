export const MEMBER_ADD = 'MEMBERS_OFF:MEMBER_ADD'

const updateUserMembers = (payload, state) => {
  const userMemberIds = payload.user.members
  userMemberIds.forEach((id) => {
    const index = state.findIndex((member) => member.id === id)
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
    default:
      return state
  }
}

export const memberAdd = (payload) => ({
  type: MEMBER_ADD,
  payload,
})
