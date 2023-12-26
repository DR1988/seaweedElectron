import {
  steppers,
  SteppersValues,
  CalibrationTypeRecordValues
} from '../../Types/Types';
import React from 'react';
import { isEmpty } from 'lodash';
import { Typography } from '@mui/material';

export type Props = {
  calibrationValues: CalibrationTypeRecordValues | {};
};

export const isEmptyCalibrationValues = (
  calibrationValues: CalibrationTypeRecordValues
) => {
  return Object.values(calibrationValues).every((value) => value.time === 0);
};

export const findEmptyCalibrationValues = (
  calibrationValues: CalibrationTypeRecordValues
) => {
  const res: SteppersValues[] = [];

  steppers.forEach((s) => {
    if (
      calibrationValues[s] === undefined ||
      calibrationValues[s].time === undefined ||
      calibrationValues[s].time === 0
    ) {
      res.push(s);
    }
  });

  return res;
};

export const CalibrationChecker: React.FC<Props> = ({
  calibrationValues,
}) => {
  const emptyCalibrationValue = findEmptyCalibrationValues(
    calibrationValues as CalibrationTypeRecordValues
  );

  if (!emptyCalibrationValue.length) {
    return null;
  }

  return (
    <>
      {emptyCalibrationValue.map((v) => (
        <Typography key={v}>Необходимо задать калибровку для клапана {v}</Typography>
      ))}
    </>
  );
};
