/**
 * Return an ordered list of users by their displayName property
 * @param {*} users The list of users to order
 */
export const orderByDisplayName = (users) => (
  users.sort((user1, user2) => {
    return user1.displayName.trim().localeCompare(user2.displayName.trim())
  })
)
