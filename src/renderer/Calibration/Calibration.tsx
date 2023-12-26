import React, { FormEvent, useEffect, useState } from 'react';
import {
  CalibrationTypeRecord,
  EChannels,
  steppers,
  SteppersValues,
  CalibrationTypeRecordValues,
  CalibrationValue
} from '../../Types/Types';
import { isNumber, isDecimalNumber } from '../helpers/numberValidator';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';



export type CalibrationProps = {
  closeCalibration: (close: boolean) => void;
  showCalibration: boolean;
  calibrate: (id: SteppersValues, steps: number) => void;
  calibrationValues?: CalibrationTypeRecordValues | undefined;
  changeCalibrationValue: (calibrationTypeRecordValues: CalibrationTypeRecordValues) => void
};

const defaultValue: CalibrationTypeRecordValues = {
  x: { steps: 0, volume: 0, time: 0 },
  z: { steps: 0, volume: 0, time: 0  },
  y: { steps: 0, volume: 0, time: 0  },
  e: { steps: 0, volume: 0, time: 0  },
};

const MIN_STEPS = 2000;
const MAX_STEPS = 50000;

export const Calibration: React.FC<CalibrationProps> = ({
  closeCalibration,
  calibrate,
  showCalibration,
  calibrationValues = defaultValue,
  changeCalibrationValue
}) => {

  const [calibrationStepsErrors, changeCalibrationStepsErrors] = useState<
    Partial<Record<SteppersValues, string>> | undefined
  >(undefined);

  const [calibrationVolumeErrors, changeCalibrationVolumeErrors] = useState<
    Partial<Record<SteppersValues, string>> | undefined
  >(undefined);

  const [isCalibrationBlock, setBlockCalibration] = useState(false);

  const [showCalibrationDataSaved, setShowCalibrationDataSaved] =
    useState(false);

  useEffect(() => {
    setBlockCalibration(false);
  }, [calibrationValues]);

  const calibrationTimePerSecond: {
    x: number;
    y: number;
    z: number;
    e: number;
  } = { x: 0, y: 0, z: 0, e: 0 };

  const handleSubmit = (e: FormEvent<HTMLButtonElement>) => {
    console.log('calibrationValues', calibrationValues);
    let hasErrors = false;

    if (calibrationValues && !Object.values(calibrationValues).length) {
      const errors = steppers.reduce((acc, step) => {
        return {
          ...acc,
          [step]: 'Необходио задать значения',
        };
      }, {});

      changeCalibrationStepsErrors(errors);
      changeCalibrationVolumeErrors(errors);
      return;
    }

    calibrationValues &&
      Object.entries(calibrationValues).forEach((entry) => {
        const [key, value] = entry as unknown as [
          SteppersValues,
          CalibrationValue
        ];
        if (!value.steps) {
          hasErrors = true;
          changeCalibrationStepsErrors((prev) => {
            return {
            ...prev,
            [key]: 'Необходио задать значения',
          }});
        } else {
          const newCalibrationErrors = { ...calibrationStepsErrors };
          delete newCalibrationErrors[key];
          changeCalibrationStepsErrors(newCalibrationErrors);
        }

        if (!value.volume) {
          hasErrors = true;
          changeCalibrationVolumeErrors((prev) => {
            return {
              ...prev,
              [key]: 'Необходио задать значения',
            };
          });
        } else {
          const newCalibrationErrors = { ...calibrationVolumeErrors };
          delete newCalibrationErrors[key];
          changeCalibrationVolumeErrors(newCalibrationErrors);
          const volumePerSecond = calibrationValues[key].time / value.volume;
          calibrationTimePerSecond[key] = volumePerSecond;
        }
      });

    if (hasErrors) {
      return;
    }

    window.electron.ipcRenderer.sendMessage(EChannels.saveCalibration, {
      calibrationValues,
      calibrationTimePerSecond,
    });
  };

  useEffect(() => {
    window.electron.ipcRenderer.on(EChannels.calibrationDataSaved, () => {
      setShowCalibrationDataSaved(true);
    });
  }, []);

  useEffect(() => {
    if (showCalibrationDataSaved) {
      setTimeout(() => {
        setShowCalibrationDataSaved(false);
      }, 3000);
    }
  }, [showCalibrationDataSaved]);

  return (
    <Dialog
      maxWidth="md"
      open={showCalibration}
      onClose={() => closeCalibration(false)}
    >
      <DialogTitle>Калибровка</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => closeCalibration(false)}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <List
          dense
          disablePadding
          sx={{
            listStyleType: 'decimal',
            pl: 2,
            '& .MuiListItem-root': {
              display: 'list-item',
            },
          }}
        >
          <ListItem disablePadding>
            <Typography paragraph={false} component="span" variant="body1">
              Для проведения калибровки введите значение в поля{' '}
              <Typography
                paragraph={false}
                component="span"
                sx={{ fontStyle: 'italic' }}
              >
                'Количество шагов для калибровки'.
              </Typography>{' '}
              Больше{' '}
              <Typography
                paragraph={false}
                component="span"
                sx={{ fontWeight: 'bold' }}
              >
                {MIN_STEPS}
              </Typography>
              , но не больше{' '}
              <Typography
                paragraph={false}
                component="span"
                sx={{ fontWeight: 'bold' }}
              >
                {MAX_STEPS}
              </Typography>
              .
            </Typography>
          </ListItem>
          <ListItem disablePadding>
            <Typography variant="body1" paragraph={false} component="span">
              После ввода численного значения нажмите кнопку{' '}
              <Typography
                paragraph={false}
                component="span"
                sx={{ fontStyle: 'italic' }}
              >
                'Калибровать'.{' '}
              </Typography>
            </Typography>
          </ListItem>
          <ListItem disablePadding>
            <Typography variant="body1">
              После отработки клапана, система определит время потраченное на
              работу клапан и необходимо будет записать количество пролитой
              жидкости
            </Typography>
          </ListItem>
        </List>
        {steppers.map((id) => (
          <Grid
            marginBottom={1}
            marginTop={2}
            key={id}
            container
            gap={2}
            alignItems="flex-start"
          >
            <Grid item xs={3}>
              <TextField
                error={!!calibrationStepsErrors?.[id]}
                label={`Количество шагов для клапана ${id.toUpperCase()}`}
                value={calibrationValues?.[id]?.steps || 0}
                helperText={calibrationStepsErrors?.[id] || ' '}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isNumber(value)) {
                    console.log('calibrationValues', calibrationValues);
                    
                    if (calibrationValues) {
                      const newCalibrationValues = {
                        ...calibrationValues,
                      };
                      newCalibrationValues[id] = {
                        ...newCalibrationValues[id],
                        steps: parseInt(value),
                      };
                      changeCalibrationStepsErrors((prev) => ({
                        ...prev,
                        [id]: '',
                      }));
                      console.log('newCalibrationValues', newCalibrationValues);
                      
                      changeCalibrationValue(newCalibrationValues);
                    } else {
                      const newCalibrationValues = {[id]: {
                        steps: parseInt(value),
                      }}
                      changeCalibrationStepsErrors((prev) => ({
                        ...prev,
                        [id]: '',
                      }));
                      changeCalibrationValue(newCalibrationValues);
                    }
                  }
                }}
              />
            </Grid>
            <Grid item display="flex" justifyContent="center" xs={3}>
              <TextField
                error={!!calibrationVolumeErrors?.[id]}
                label="Пролитый Объем (мл)"
                value={calibrationValues?.[id]?.volume || 0}
                helperText={calibrationVolumeErrors?.[id] || ' '}
                onBlur={e => {
                  const value = e.target.value
                  if (isDecimalNumber(value) && value.endsWith('.')) {
                    const newCalibrationValues = {
                      ...calibrationValues,
                    };
                    newCalibrationValues[id] = {
                      ...newCalibrationValues[id],
                      volume: parseFloat(value),
                    };
                    changeCalibrationVolumeErrors((prev) => ({
                      ...prev,
                      [id]: '',
                    }));
                    changeCalibrationValue(newCalibrationValues);
                  } else {
                    const newCalibrationValues = {
                      ...calibrationValues,
                    };
                    newCalibrationValues[id] = {
                      ...newCalibrationValues[id],
                      volume: parseFloat(value),
                    };
                    changeCalibrationVolumeErrors((prev) => ({
                      ...prev,
                      [id]: '',
                    }));
                    changeCalibrationValue(newCalibrationValues);
                  }
                }}
                onChange={(e) => {
                  if (calibrationValues) {
                    const value = e.target.value;
                    
                    if (isDecimalNumber(value)) {
                      const newCalibrationValues = {
                        ...calibrationValues,
                      };
                      newCalibrationValues[id] = {
                        ...newCalibrationValues[id],
                        volume: value, 
                      };
                      changeCalibrationVolumeErrors((prev) => ({
                        ...prev,
                        [id]: '',
                      }));
                      changeCalibrationValue(newCalibrationValues);
                    }
                  } else {
                    changeCalibrationValue({
                      x: { steps: 0, volume: 0, time: 0},
                      y: { steps: 0, volume: 0, time: 0 },
                      z: { steps: 0, volume: 0, time: 0 },
                      e: { steps: 0, volume: 0, time: 0 },
                    });
                  }
                }}
              />
            </Grid>
            <Grid item display="flex" alignItems="flex-end" xs={3} height={56}>
              {!!calibrationValues?.[id]?.time ? (
                <Typography variant="body1">
                  Калибровка заняла:
                  <Typography>
                    <Typography
                      paragraph={false}
                      component="span"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {calibrationValues[id].time}
                    </Typography>{' '}
                    секунд
                  </Typography>
                </Typography>
              ) : null}
            </Grid>
            <Grid item display="flex" xs={2}>
              <Button
                variant="contained"
                disabled={isCalibrationBlock}
                onClick={() => {
                  if ((calibrationValues?.[id]?.steps || 0) > MAX_STEPS) {
                    changeCalibrationStepsErrors((prev) => ({
                      ...prev,
                      [id]: `Задать значение меньше ${MAX_STEPS}`,
                    }));
                    return;
                  } else if ((calibrationValues?.[id]?.steps || 0) < MIN_STEPS) {
                    changeCalibrationStepsErrors((prev) => ({
                      ...prev,
                      [id]: `Задать значение больше ${MIN_STEPS}`,
                    }));
                    return;
                  }
                  calibrationValues &&
                    calibrate(id, calibrationValues[id].steps);

                  setBlockCalibration(true);
                }}
              >
                Калибровать
              </Button>
            </Grid>

            <Grid>
              {showCalibrationDataSaved ? (
                <Typography>Данные сохранены</Typography>
              ) : null}
            </Grid>
          </Grid>
        ))}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={(e) => handleSubmit(e)}>
          Сохранить
        </Button>
        <Button onClick={() => closeCalibration(false)}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};
