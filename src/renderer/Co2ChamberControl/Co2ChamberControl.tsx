import React, { useState } from 'react';
import { InitialValues } from '../../Types/StorageTypes';
import { useEffect } from 'react';
import { Connection } from '../../Types/Types';
import { Button, FormControlLabel, Grid, Switch } from '@mui/material';
import { Row } from '../Components/Row';

export type Props = {
  initialValues: InitialValues;
  connection: Connection;
  co2Value: string | null;
  start: boolean;
};

const timeInterval = 3000;

const sendCo2Data = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serialCo2:transfer',
    '@RRDT',
  ]);
};

export const startCO2Valve = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `cO|\n`,
  ]);
};

export const stopCO2Valve = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `cC|\n`,
  ]);
};

export const startCO2PurgeValve = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `cO|pO|\n`,
  ]);
};

export const stopCO2PurgeValve = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `cC|pC|\n`,
  ]);
};

export const Co2ChamberControl: React.FC<Props> = ({
  initialValues,
  connection,
  co2Value,
  start,
}) => {
  const [isPurge, setPurge] = useState(false);

  const { initialMaxCO2Value, initialMinCO2Value } = initialValues;
  const minC02Value = Number(initialMinCO2Value);
  const maxC02Value = Number(initialMaxCO2Value);

  useEffect(() => {
    let intervalId = -1;
    console.log('connectionconnection', connection);
    if (start && connection === 'connected') {
      intervalId = setInterval(() => {
        console.log('CO2 CALL');
        sendCo2Data();
      }, timeInterval);
    } else {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [connection, start]);

  useEffect(() => {
    if (co2Value) {
      const currentCO2Value = Number(co2Value);
      if (currentCO2Value < minC02Value) {
        console.log(111111);
        if (isPurge) {
          startCO2PurgeValve();
        } else {
          startCO2Valve();
        }
      }

      if (currentCO2Value > maxC02Value) {
        console.log(99999);
        if (isPurge) {
          stopCO2PurgeValve();
        } else {
          stopCO2Valve();
        }
      }
    }
  }, [co2Value]);

  return (
    <Grid>
      <Row>
        <FormControlLabel
          onChange={() => setPurge(!isPurge)}
          control={<Switch checked={isPurge} />}
          label="Использовать продувку"
        />
      </Row>
    </Grid>
  );
};
