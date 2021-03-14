export const toggleMuteApp = () => {
  let isMuted

  document.querySelectorAll('#sip-audio audio').forEach((audio) => {
    audio.muted = !audio.muted
    isMuted = audio.muted
  })

  return isMuted
}
