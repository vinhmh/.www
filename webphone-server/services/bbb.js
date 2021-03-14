import axios from 'axios'
import sha1 from 'sha1'
import config from '../config'

const { bbb_secret, host } = config

export const getMeetings = () => {
  const checksum = sha1('getMeetings' + bbb_secret)
  return axios.get(host + '/getMeetings?checksum=' + checksum)
}

export const getMeetingInfo = (query) => {
  const checksum = sha1('getMeetingInfo' + query + bbb_secret)
  return axios.get(host + '/getMeetingInfo?' + query + '&checksum=' + checksum)
}

export const createMeeting = (query) => {
  const checksum = sha1('create' + query + bbb_secret)
  return axios.get(host + '/create?' + query + '&checksum=' + checksum)
}

export const endMeeting = (query) => {
  const checksum = sha1('end' + query + bbb_secret)
  return axios.get(host + '/end?' + query + '&checksum=' + checksum)
}

export const joinMeetingUrl = (query) => {
  const checksum = sha1('join' + query + bbb_secret)
  return host + '/join?' + query + '&checksum=' + checksum
}
