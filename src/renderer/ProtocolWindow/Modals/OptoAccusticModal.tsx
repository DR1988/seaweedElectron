import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import styles from './modal.module.css';
import { OptoAccusticItem } from '../../../Types/Types';
import { Row } from '../../Components/Row';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { getHoursAndMinutes } from '../../helpers/getHoursAndMinutes';

type ModalProps = {
  selectedItem: OptoAccusticItem;
  closeModal: () => void;
  changeStartTime: (value: number) => void;
  changeEndTime: (value: number) => void;
  resetToPreviousChanges: () => void;
  shouldCloseOnEsp?: boolean;
  removeCurrentItem: () => void;
};

export const OptoAccusticModal: React.FC<ModalProps> = ({
  closeModal,
  changeStartTime,
  changeEndTime,
  resetToPreviousChanges,
  shouldCloseOnEsp = true,
  selectedItem,
  removeCurrentItem,
}) => {
  const [openRemoveModal, setRemoveModal] = useState(false);
  const [localStartTimeHours, setLocalStartTimeHours] = useState(0);
  const [localStartTimeMinutes, setLocalStartTimeMinutes] = useState(0);
  const [localEndTimeHours, setLocalEndTimeHours] = useState(0);
  const [localEndTimeMinutes, setLocalEndTimeMinutes] = useState(0);

  const { wrongSign, endTime = 0, startTime = 0 } = selectedItem;
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
        +e.target.value.trim() >= 0 &&
        +e.target.value.trim() < 24
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

  const _changeLocalEndTimeHour = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (
        Number.isInteger(+e.target.value.trim()) &&
        +e.target.value.trim() >= 0
      ) {
        setLocalEndTimeHours(+e.target.value);

        const { minutes } = getHoursAndMinutes(endTime);

        const minutesInSeconds = minutes * 60;
        changeEndTime(minutesInSeconds + 3600 * Number(e.target.value));
      }
    },
    [changeEndTime, endTime]
  );

  const _changeLocalEndTimeMinutes = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (
        Number.isInteger(+e.target.value.trim()) &&
        +e.target.value.trim() >= 0 &&
        +e.target.value.trim() < 60
      ) {
        setLocalEndTimeMinutes(+e.target.value);

        const { hours } = getHoursAndMinutes(endTime);

        const hoursInSeconds = hours * 3600;
        changeEndTime(hoursInSeconds + 60 * Number(e.target.value));
      }
    },
    [changeEndTime, endTime]
  );

  return (
    <div
      ref={coverRef}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (shouldCloseOnEsp && e.keyCode === 27) {
          if (openRemoveModal) {
            setRemoveModal(false);
          } else {
            resetToPreviousChanges?.();
            closeModal();
          }
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
              <Typography>Время окончания</Typography>
            </Row>
            <Row>
              <div className={styles.input_content}>
                <TextField
                  id="endTime-id-h"
                  value={localEndTimeHours}
                  label="Часы"
                  onChange={_changeLocalEndTimeHour}
                />
              </div>
              <div className={styles.input_content}>
                <TextField
                  id="endTime-id-m"
                  value={localEndTimeMinutes}
                  label="Минуты"
                  onChange={_changeLocalEndTimeMinutes}
                />
              </div>
            </Row>
          </div>
          <section className={styles.button_container}>
            <div className={styles.button_left}>
              <Button
                onClick={() => {
                  setRemoveModal(true);
                }}
                variant="contained"
              >
                Удалить
              </Button>
            </div>

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
          {openRemoveModal ? <div className={styles.modalCover} /> : null}
        </div>

        {openRemoveModal ? (
          <section className={styles.containerModal}>
            <div className={styles.contentModal}>
              <Grid container className={styles.titleContainer}>
                <Typography>Уверены что хотите удалить?</Typography>
              </Grid>
              <Grid container className={styles.buttonContainer}>
                <Button
                  onClick={() => {
                    setRemoveModal(false);
                    closeModal();
                    removeCurrentItem();
                  }}
                  variant="contained"
                >
                  ДА
                </Button>
                <Button
                  onClick={() => setRemoveModal(false)}
                  variant="contained"
                >
                  Нет
                </Button>
              </Grid>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};
