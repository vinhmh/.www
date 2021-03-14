export default (user, options = {}) => {
  const result = {
    id: user.id,
    active: user.active,
    username: user.username,
    meeting: user.meeting,
    department: user.department
  }

  return result
}
