export const getDifferentTime = (startDate, endDate, distanceTimeStop) => {
  const one_second = 1000;
  const one_minute = one_second * 60;
  const one_hour = one_minute * 60;
  const one_day = one_hour * 24;

  // Convert both dates to milliseconds
  const startDate_ms = Date.parse(startDate);
  const endDate_ms = endDate.getTime();
  // Calculate the difference in milliseconds
  let difference_ms = endDate_ms - startDate_ms-distanceTimeStop;
  if(difference_ms < 0) difference_ms=0
  // Convert back to days and return
  return {
    getDays: () => Math.floor(difference_ms / one_day),
    getHours: () => Math.floor((difference_ms % one_day) / one_hour),
    getMinutes: () => Math.floor(((difference_ms % one_day) % one_hour) / one_minute),
    getSeconds: () => Math.floor((((difference_ms % one_day) % one_hour) % one_minute) / one_second),
  };
};

export const twoDigitFormatter = (number) => {
  if (number < 10) return '0' + number;
  return number;
};
