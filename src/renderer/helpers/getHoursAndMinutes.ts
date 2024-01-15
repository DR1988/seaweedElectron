export const Seconds_In_Minute = 60;
export const Seconds_In_Hour = 3600;

export const getHoursAndMinutes = (time: number) => {
  const hours = Math.floor(time / Seconds_In_Hour);
  let minutes = 0;
  if (hours > 0) {
    const min = time / Seconds_In_Minute;
    minutes = min - hours * Seconds_In_Minute;
  } else {
    minutes = Math.floor(time / Seconds_In_Minute);
  }

  const days = Math.max(1, Math.ceil(time / 3600 / 24));

  return {
    hours,
    minutes,
    days,
  };
};
