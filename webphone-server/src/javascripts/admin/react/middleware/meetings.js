/**
 * Compares 2 arrays and returns true if equal
 * @param {Array} a first array 
 * @param {Array} b second array
 */
export const arrayEquals = (a, b) => {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

/**
 * Return an array that don't contain element from a second array
 * @param {*} a The array to filter
 * @param {*} b The elements to remove
 */
export const notIn = (a, b) => {
  return a.filter(value => !b.includes(value))
}

/**
 * Return an object containing the list of inactive meetings (diff between all meetings and actives)
 * @param {*} actives The list of actives meetings
 * @param {*} meetings The list of all meetings
 */
export const filterInactiveMeetings = (actives, meetings) => {
  const inactives = {}
  const inactiveNames = notIn(Object.keys(meetings), Object.keys(actives))

  inactiveNames.forEach(meetingId => {
    inactives[meetingId] = meetings[meetingId] || {}
  })

  return inactives
}

/**
 * Return an object containing the list of active meetings
 * @param {Array} users The list of connected users
 * @param {Object} meetings The list of available meetings (some are without connected users and will be filtered)
 */
export const filterActiveMeetings = (users, meetings) => {
  const actives = {};

  distinctMeetings(users).forEach(meetingId => {
    actives[meetingId] = meetings[meetingId] || {};
  })
  return actives;
}

/**
 * Return true if the meeting contains at least one user connected
 * @param {Array} users The list of connected users
 * @param {String} meetingId The meeting to check
 */
export const hasUsersForMeeting = (users, meetingId) => (users.some(user => user.meetingID === meetingId));

/**
 * Return the list of users connected to a meeting
 * @param {Array} users The list of connected users to filter
 * @param {String} meetingId The meeting to check
 */
export const filtersUserForMeeting = (users, meetingId) => (users.filter(user => user.meetingID === meetingId));

/**
 * Return the list of distinct meetings depending on users
 * @param {Array} users The list of connected users
 */
export const distinctMeetings = (users) => ([...new Set(users.map(x => x.meetingID))]);

/**
 * 
 * @param {Object} meeting  The meeting
 * @param {String} roomId        The Id of the room to find
 */
export const getConferenceRoomNameById = (meeting, roomId) => {

  if (!meeting || !(roomId in meeting)) {
    return roomId
  }

  const room = meeting[roomId]
  return room.code?.toUpperCase() || room.title?.toUpperCase() || roomId
}
