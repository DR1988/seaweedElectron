import React from 'react';
import styles from './timeLine.module.css';
import { getHoursAndMinutes } from '../../helpers/getHoursAndMinutes';

type TimeLineProps = {
  allTime: number;
  width: number;
  scale?: number;
  chunks?: number;
};

type TimeInterval = 'Секунды' | 'Минуты' | 'Часы';

export const TimeLine: React.FC<TimeLineProps> = ({
  allTime,
  width,
  chunks = 10,
  scale = 1,
}) => {
  let totalDays = 1;
  const dividersTemplatesDays = [];
  const chunk = width / chunks;

  let timeInterval: TimeInterval = 'Секунды';

  const { hours, minutes } = getHoursAndMinutes(allTime);

  if (minutes > 0) {
    timeInterval = 'Минуты';
  }

  if (hours > 0) {
    timeInterval = 'Часы';
  }

  if (hours > 24) {
    const days = Math.ceil(hours / 24);
    totalDays = days;
  }

  const parts = 12 * scale * totalDays;
  const totalHours = 24 * totalDays;
  for (let i = 0; i < parts; i++) {
    const isLast = i === parts - 1;

    let shouldUseSmall = false;
    const lastTime = isLast ? (totalHours * (i + 1)) / parts : 0;
    let time = (totalHours * i) / parts;
    if (!Number.isInteger(time)) {
      time = Math.round((time - Math.floor(time)) * 60);
      shouldUseSmall = true;
    }

    dividersTemplatesDays.push(
      <div
        key={i}
        style={{
          width: (1200 / parts) * scale * totalDays,
        }}
        className={styles.timeFormer}
      >
        <div>
          <div
            style={{
              height: shouldUseSmall ? '12px' : '22px',
            }}
            className={styles.divider}
          />
          <div
            style={{
              top: !isLast && shouldUseSmall ? '-10px' : '0px',
            }}
            className={styles.timeCount}
          >
            {time}
          </div>
        </div>
        {isLast ? (
          <div style={{ position: 'relative' }}>
            <div className={styles.divider} />
            <div
              style={{
                left: '-20px',
              }}
              className={styles.timeCount}
            >
              {lastTime}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section
      style={{ width: `calc(${totalDays * scale * 100}% - ${scale * 20}px)` }}
      className={styles.timeLine}
    >
      <div
        // style={{ width: `calc(${scale * 100}% - 20px)` }}
        className={styles.timeShow}
      >
        {/*<div style={{ width: `calc(100% - 20px)` }} className={styles.timeShow}>*/}
        {/*{dividersTemplates}*/}
        {dividersTemplatesDays}
      </div>
      <span>{timeInterval}</span>
    </section>
  );
};
