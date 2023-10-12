import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import styles from './modal.module.css';
import { Direction, StepperItem } from '../../../Types/Types';
import { Row } from '../../Components/Row';
import { Button, TextField, Typography } from '@mui/material';
import { getHoursAndMinutes } from '../../helpers/getHoursAndMinutes';

type ModalProps = {
  selectedItem: StepperItem;
  closeModal: () => void;
  changeStartTime: (value: number) => void;
  changeVolume: (value: number) => void;
  changeDirection?: (value: Direction) => void;
  direction?: Direction;
  resetToPreviousChanges: () => void;
  shouldCloseOnEsp?: boolean;
};

export const StepperModalNew: React.FC<ModalProps> = ({
  closeModal,
  changeStartTime,
  changeVolume,
  changeDirection,
  resetToPreviousChanges,
  direction,
  shouldCloseOnEsp = true,
  selectedItem,
}) => {
  const { wrongSign, volume = 0, endTime = 0, startTime = 0 } = selectedItem;
  const [localStartTimeHours, setLocalStartTimeHours] = useState(0);
  const [localStartTimeMinutes, setLocalStartTimeMinutes] = useState(0);
  const [localEndTimeHours, setLocalEndTimeHours] = useState(0);
  const [localEndTimeMinutes, setLocalEndTimeMinutes] = useState(0);

  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    coverRef?.current?.focus();
  }, []);

  useEffect(() => {
    if (startTime) {
      const { hours, minutes } = getHoursAndMinutes(startTime);

      setLocalStartTimeHours(hours);
      setLocalStartTimeMinutes(minutes);
    }
  }, [startTime]);

  useEffect(() => {
    if (endTime) {
      const { hours, minutes } = getHoursAndMinutes(endTime);

      setLocalEndTimeHours(hours);
      setLocalEndTimeMinutes(minutes);
    }
  }, [endTime]);

  const _changeLocalStartTimeHour = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (
        Number.isInteger(+e.target.value.trim()) &&
        +e.target.value.trim() >= 0
      ) {
        setLocalStartTimeHours(+e.target.value);
        const { minutes } = getHoursAndMinutes(startTime);

        const minutesInSeconds = minutes * 60;
        changeStartTime(minutesInSeconds + 3600 * Number(e.target.value));
      }
    },
    [changeStartTime, startTime]
  );

  const _changeLocalStartTimeMinutes = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (
        Number.isInteger(+e.target.value.trim()) &&
        +e.target.value.trim() >= 0 &&
        +e.target.value.trim() < 60
      ) {
        setLocalStartTimeMinutes(+e.target.value);

        const { hours } = getHoursAndMinutes(startTime);

        const hoursInSeconds = hours * 3600;

        changeStartTime(hoursInSeconds + 60 * Number(e.target.value));
      }
    },
    [changeStartTime, startTime]
  );

  const _changeVolume = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (
        Number.isInteger(+e.target.value.trim()) &&
        +e.target.value.trim() >= 0
      ) {
        changeVolume(+e.target.value);
      }
    },
    [changeVolume]
  );

  return (
    <div
      ref={coverRef}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (shouldCloseOnEsp && e.keyCode === 27) {
          resetToPreviousChanges?.();
          closeModal();
        }
      }}
      className={styles.cover}
      tabIndex={1}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <div>
            <Row className={styles.timeBox}>
              <Typography>Время начала</Typography>
            </Row>
            <Row className={styles.input_container}>
              <div className={styles.input_content}>
                <TextField
                  id="start-time-h"
                  value={localStartTimeHours}
                  label="Часы"
                  onChange={_changeLocalStartTimeHour}
                />
              </div>
              <div className={styles.input_content}>
                <TextField
                  id="start-time-m"
                  value={localStartTimeMinutes}
                  label="Минуты"
                  onChange={_changeLocalStartTimeMinutes}
                />
              </div>
            </Row>

            <Row className={styles.timeBox}>
              <Typography>Введите объем</Typography>
            </Row>
            <Row>
              <div className={styles.input_content}>
                <TextField
                  id="volume-id"
                  value={volume}
                  label="Объем"
                  onChange={_changeVolume}
                />
              </div>
              <div className={styles.input_content}>
                <TextField label="Время окончания" value={endTime} disabled />
              </div>
            </Row>
          </div>

          <section className={styles.button_container}>
            <div className={styles.input_content}>
              <Button
                onClick={() => {
                  closeModal();
                  resetToPreviousChanges();
                }}
                variant="contained"
              >
                Закрыть
              </Button>
            </div>
            <div className={styles.input_content}>
              <Button
                onClick={closeModal}
                variant="contained"
                disabled={!!wrongSign}
              >
                Применить
              </Button>
            </div>
          </section>
          {wrongSign && (
            <div>
              <span>{wrongSign}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
