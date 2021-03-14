export const formatTimestamp = (timestamp) => {
  // Unixtimestamp
  const unixtimestamp = timestamp

  // Months array
  //   const months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Convert timestamp to milliseconds
  const date = new Date(unixtimestamp)
  // Year
  //   const year = date.getFullYear()

  //   // Month
  //   const month = months_arr[date.getMonth()]

  //   // Day
  //   const day = date.getDate()

  //   // Hours
  const hours = date.getHours()

  // Minutes
  const minutes = '0' + date.getMinutes()

  // Seconds
  //   const seconds = '0' + date.getSeconds()

  // Display date time in MM-dd-yyyy h:m:s format
  const convdataTime = hours + ':' + minutes.substr(-2)

  return convdataTime
}
