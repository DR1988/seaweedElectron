import React, { useEffect, useRef, useState } from 'react';

import { isDecimalNumber } from '../helpers/numberValidator';
import { InitialValues } from '../../Types/StorageTypes';
import { EChannels } from '../../Types/Types';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import styles from './initialSettings.module.css';

const MIN_Co2_VALUE = 0.01;
const MAX_Co2_VALUE = 5;

export type InitialProps = {
  initialValues: InitialValues;
  setInitialValues: (key: keyof InitialValues, value: string) => void;
  saveValues: () => void;
  initialValuesSet: boolean;
};

export const InitialSettings: React.FC<InitialProps> = ({
  initialValues,
  setInitialValues,
  saveValues,
  initialValuesSet,
}) => {
  const [showDataSaved, setShowDataSaved] = useState(false);
  const [volumeError, setVolumeError] = useState('');
  const [minError, setMinError] = useState('');
  const [maxError, setMaxError] = useState('');

  useEffect(() => {
    window.electron.ipcRenderer.on(EChannels.initialsDataSaved, () => {
      setShowDataSaved(true);
    });
  }, []);

  useEffect(() => {
    if (showDataSaved) {
      setTimeout(() => {
        setShowDataSaved(false);
      }, 3000);
    }
  }, [showDataSaved]);

  const valuesSet = useRef(false);
  useEffect(() => {
    if (initialValues && initialValuesSet && !valuesSet.current) {
      valuesSet.current = true;
      Object.keys(initialValues).forEach((key) => {
        if (key === 'initialVolume') {
          const value = initialValues[key];
          if (Number(value) <= 0) {
            setVolumeError('Необходимл задать значение');
          } else {
            setVolumeError('');
          }
        }

        if (key === 'initialMinCO2Value') {
          const value = initialValues[key];
          if (Number(value) < MIN_Co2_VALUE) {
            setMinError(`Значение не может быть меньше ${MIN_Co2_VALUE} %`);
          } else if (Number(value) >= MAX_Co2_VALUE) {
            setMinError(`Значение не может быть больше ${MAX_Co2_VALUE} %`);
          } else {
            setMinError('');
          }
        }

        if (key === 'initialMaxCO2Value') {
          const value = initialValues[key];
          if (Number(value) <= MIN_Co2_VALUE) {
            setMaxError(`Значение не может быть меньше ${MIN_Co2_VALUE} %`);
          } else if (Number(value) > MAX_Co2_VALUE) {
            setMaxError(`Значение не может быть больше ${MAX_Co2_VALUE} %`);
          } else {
            setMaxError('');
          }
        }
      });
    }
  }, [initialValues]);

  const disabledSaved = !!maxError || !!minError || !!volumeError;
  return (
    <Grid className={styles.container} container marginTop="2rem" marginBottom="2rem">
      <Typography className={styles.header}>Настройка подачи углекислого газа</Typography>
      <Box className={styles.content}>
        <Grid item xs={12} marginBottom="1rem">
          <Typography>
            Минимальное значение для Co2:{' '}
            <Typography component="span" sx={{ fontWeight: 'bold' }}>
              {MIN_Co2_VALUE}%
            </Typography>
          </Typography>
          <Typography>
            Максмимальное значение для Co2:{' '}
            <Typography sx={{ fontWeight: 'bold' }} component="span">
              {MAX_Co2_VALUE}%
            </Typography>
          </Typography>
        </Grid>

        <Grid container item alignItems={'center'}>
          <Grid item xs={3}>
            <TextField
              value={initialValues?.['initialVolume']}
              label="Объем камеры (литры):"
              error={!!volumeError}
              helperText={volumeError}
              onChange={(event) => {
                const value = event.target.value;
                if (!isDecimalNumber(value)) {
                  return;
                }

                setInitialValues('initialVolume', value);
              }}
              onBlur={(event) => {
                const value = event.target.value;

                if (!isDecimalNumber(event.target.value)) {
                  return;
                }

                if (Number(value) <= 0) {
                  setVolumeError('Необходимл задать значение');
                } else {
                  setVolumeError('');
                }

                setInitialValues('initialVolume', Number(value).toString());
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              value={initialValues?.['initialMinCO2Value']}
              label="Минимальное значение Co2 (%):"
              error={!!minError}
              helperText={minError}
              onChange={(event) => {
                const value = event.target.value;

                if (!isDecimalNumber(value)) {
                  return;
                }

                setInitialValues('initialMinCO2Value', value);
              }}
              onBlur={(event) => {
                const value = event.target.value;

                if (!isDecimalNumber(event.target.value)) {
                  return;
                }

                if (Number(value) < MIN_Co2_VALUE) {
                  setMinError(`Значение не может быть меньше ${MIN_Co2_VALUE} %`);
                } else if (Number(value) >= +initialValues.initialMaxCO2Value) {
                  setMinError(
                    `Значение должно быть меньше ${initialValues.initialMaxCO2Value} %`
                  );
                } else if (Number(value) >= MAX_Co2_VALUE) {
                  setMinError(`Значение не может быть больше ${MAX_Co2_VALUE} %`);
                } else {
                  setMinError('');
                }

                setInitialValues('initialMinCO2Value', Number(value).toString());
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              value={initialValues?.['initialMaxCO2Value']}
              label="Максимальное значение Co2 (%):"
              error={!!maxError}
              helperText={maxError}
              onChange={(event) => {
                const value = event.target.value;

                if (!isDecimalNumber(event.target.value)) {
                  return;
                }
                setInitialValues('initialMaxCO2Value', value);
              }}
              onBlur={(event) => {
                const value = event.target.value;
                if (!isDecimalNumber(event.target.value)) {
                  return;
                }

                if (Number(value) <= MIN_Co2_VALUE) {
                  setMaxError(`Значение не может быть меньше ${MIN_Co2_VALUE} %`);
                } else if (Number(value) <= +initialValues.initialMinCO2Value) {
                  setMaxError(
                    `Значение не может быть меньше ${initialValues.initialMinCO2Value} %`
                  );
                } else if (Number(value) > MAX_Co2_VALUE) {
                  setMaxError(`Значение не может быть больше ${MAX_Co2_VALUE} %`);
                } else {
                  setMaxError('');
                }
                setInitialValues('initialMaxCO2Value', Number(value).toString());
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <Button
              variant="contained"
              disabled={disabledSaved}
              onClick={saveValues}
            >
              Сохранить значения
            </Button>
          </Grid>
        </Grid>
        {showDataSaved ? (
          <Grid item xs={12}>
            <Typography sx={{ fontWeight: 'bold' }} component="span">
              Данные Сохранены
            </Typography>
          </Grid>
        ) : null}
      </Box>
    </Grid>
  );
};
