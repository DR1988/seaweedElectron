import { Typography } from '@mui/material';
import React, { memo, useEffect, useRef, useState } from 'react';

export type Props = {
  start: boolean;
  finish: boolean;
};

const TIMER_INTERVAL = 100;

export const Timer: React.FC<Props> = memo(({ start, finish }) => {
  const [timeSpent, setTimeSpent] = useState(0);

  const intervalIdRef = useRef<NodeJS.Timer | number>(-1);

  useEffect(() => {
    if (start) {
      intervalIdRef.current = setInterval(() => {
        setTimeSpent((value) => value + TIMER_INTERVAL);
      }, TIMER_INTERVAL);
    } else {
      clearInterval(intervalIdRef.current);
      setTimeSpent(0);
    }
  }, [start]);

  useEffect(() => {
    if (finish) {
      clearInterval(intervalIdRef.current);
    }
  }, [finish]);

  return (
    <div>
      <Typography>Timer: {timeSpent / 1000}</Typography>
    </div>
  );
});
