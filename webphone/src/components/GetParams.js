import Cookies from 'js-cookie'

const setupBrowserId = (skip = false) => {
  if (skip) return null
  let id = Cookies.get('browserID')

  if (!id) {
    id = Math.random().toString(36).substr(2)
    Cookies.set('browserID', id, { expires: 365 })
  }

  return id
}

export default () => {
  const params = new URLSearchParams(window.location.search)
  const host = params.get('voipHost') || CONFIG.voipHost
  const username = params.get('username')
  const password = params.get('password')
  const role = params.get('role')
  const cf1 = params.get('cf1')
  const cf2 = params.get('cf2')
  const roomsList = params.getAll('roomsList')
  const lounge = params.get('lounge')
  const floor = params.get('floor')
  const useSwitcher = params.get('useSwitcher')
  const secretToken = params.get('secretToken')
  const joinUrl = params.get('joinUrl')
  const debug = params.get('debug')
  const userAuth = params.get('userAuth')
  const skipBrowserID = params.get('skipBrowserID')
  const browserID = setupBrowserId(skipBrowserID)
  const meetingID = params.get('meetingID')
  const coordinator = params.get('coordinator')

  return {
    host,
    username,
    password,
    role,
    cf1,
    cf2,
    roomsList,
    lounge,
    floor,
    useSwitcher,
    secretToken,
    joinUrl,
    debug,
    userAuth,
    browserID,
    meetingID,
    coordinator
  }
}
