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
  const dividersTemplates = [];
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

  const parts = 12 * scale;
  for (let i = 0; i < parts; i++) {
    const isLast = i === parts - 1;
    dividersTemplatesDays.push(
      <div
        key={i}
        style={{
          width: (1200 / parts) * scale,
        }}
        className={styles.timeFormer}
      >
        <div
        // style={{ transform: `scaleX(${1 / scale})` }}
        >
          <div className={styles.divider} />
          <div className={styles.timeCount}>{(24 * i) / parts}</div>
        </div>
        {isLast ? (
          <div style={{ position: 'relative' }}>
            <div className={styles.divider} />
            <div className={styles.timeCount}>{(24 * (i + 1)) / parts}</div>
          </div>
        ) : null}
      </div>
    );
  }

  for (let i = 0; i < chunks; i++) {
    const isLast = i === chunks - 1;

    dividersTemplates.push(
      <div
        key={i}
        style={{
          width: scale * chunk,
        }}
        className={styles.timeFormer}
      >
        <div
        // style={{ transform: `scaleX(${1 / scale})` }}
        >
          <div className={styles.divider} />
          <div className={styles.timeCount}>{(allTime * i) / chunks}</div>
        </div>
        {isLast ? (
          <div style={{ position: 'relative' }}>
            <div className={styles.divider} />
            <div className={styles.timeCount}>
              {(allTime * (i + 1)) / chunks}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section
      style={{ width: `calc(${scale * 100}% - ${scale * 20}px)` }}
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
