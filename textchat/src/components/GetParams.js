import URLSearchParams from 'url-search-params' // TODO edge 15 support

export default () => {
  const params = new URLSearchParams(window.location.search)
  const lang = params.get('lang')
  const username = params.get('username')
  const role = params.get('role')
  const meetingID = params.get('meetingID')
  const userID = params.get('userID')
  const toChannel = params.get('toChannel') || 'PUBLIC_CHANNEL'
  const skipLogin = params.get('skipLogin')
  const conversation = params.get('conversation') || false

  return { lang, username, meetingID, role, userID, toChannel, skipLogin, conversation }
}
