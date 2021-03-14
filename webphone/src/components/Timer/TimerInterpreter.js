export const getDifferentTimeInterpreter = (startDate, endDate) => {
  const one_second = 1000
  const one_minute = one_second * 60
  const one_hour = one_minute * 60
  const one_day = one_hour * 24

  // Convert both dates to milliseconds
  const startDate_ms = startDate.getTime()
  const endDate_ms = endDate.getTime()
  // Calculate the difference in milliseconds
  const difference_ms = endDate_ms-startDate_ms
  // Convert back to days and return
  return {
    getDays: () => Math.floor(difference_ms / one_day),
    getHours: () => Math.floor((difference_ms % one_day) / one_hour),
    getMinutes: () => Math.floor(((difference_ms % one_day) % one_hour) / one_minute),
    getSeconds: () => Math.floor((((difference_ms % one_day) % one_hour) % one_minute) / one_second),
  }
}