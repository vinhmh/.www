export default socket => ({
  id: socket.id,
  user: socket.user.id,
  channels: [...socket.channels]
})
