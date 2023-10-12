const Seconds_In_Minute = 60;
const Seconds_In_Hour = 3600;

export const getHoursAndMinutes = (time: number) => {
  const hours = Math.floor(time / Seconds_In_Hour);
  let minutes = 0;
  if (hours > 0) {
    const min = time / Seconds_In_Minute;
    minutes = min - hours * Seconds_In_Minute;
  } else {
    minutes = Math.floor(time / Seconds_In_Minute);
  }

  return {
    hours,
    minutes,
  };
};
