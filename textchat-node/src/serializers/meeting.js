export default (meeting, options = {}) => {
  const result = {
    id: meeting.id,
    title: meeting.title,
    conferences: meeting.conferences,
    type: meeting.type,
    hash: meeting.hash,
    createdBy: meeting.createdBy
  }

  return result
}
