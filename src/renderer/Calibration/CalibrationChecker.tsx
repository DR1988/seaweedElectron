import {
  CalibrationTypeRecord,
  steppers,
  SteppersValues,
} from '../../Types/Types';
import React from 'react';
import { isEmpty } from 'lodash';
import { Typography } from '@mui/material';

export type Props = {
  calibrationValuesTime: CalibrationTypeRecord | {};
};

export const isEmptyCalibrationValues = (
  calibrationValues: CalibrationTypeRecord
) => {
  return Object.values(calibrationValues).every((value) => value === 0);
};

export const findEmptyCalibrationValues = (
  calibrationValues: CalibrationTypeRecord
) => {
  const res: SteppersValues[] = [];

  steppers.forEach((s) => {
    if (calibrationValues[s] === undefined || calibrationValues[s] === 0) {
      res.push(s);
    }
  });

  return res;
};

export const CalibrationChecker: React.FC<Props> = ({
  calibrationValuesTime,
}) => {
  const emptyCalibrationValue = findEmptyCalibrationValues(
    calibrationValuesTime as CalibrationTypeRecord
  );

  if (!emptyCalibrationValue.length) {
    return null;
  }

  return (
    <>
      {emptyCalibrationValue.map((v) => (
        <Typography>Необходимо задать калибровку для клапана {v}</Typography>
      ))}
    </>
  );
};
