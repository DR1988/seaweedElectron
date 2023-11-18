import { stopCO2PurgeValve, stopCO2Valve } from 'renderer/Co2ChamberControl/Co2ChamberControl';
import { Brightness, SteppersValues } from '../../Types/Types';

const MAX_TIME_TO_VALVE = 999999999; // примерно 290 часов

export const startAirLiftCommand = () => 'aO|';
export const startOpticCommand = () => 'oO|';
export const startBrightCommand = (brightValue: number) => `bB${brightValue}B|`;
export const startValveCommand = (line: string) =>
  `${line}E1D1S${MAX_TIME_TO_VALVE}S|`;

export const sendBright = (brightValue: number) => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `bB${brightValue}B|\n`,
  ]);
};

export const stopBright = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `bB0B|\n`,
  ]);
};

export const startValve = (line: SteppersValues) => {
  console.log('SEND startValve', `${line}\n`);

  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `${line}E1D1S${MAX_TIME_TO_VALVE}S|\n`,
  ]);
};

export const stopValve = (line: SteppersValues) => {
  console.log('SEND stopValve', `${line}\n`);

  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `${line}E0D1S0S|\n`,
  ]);
};

export const startOptic = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `oO|\n`,
  ]);
};

export const stopOptic = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `oC|\n`,
  ]);
};

export const startAirLift = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `aO|\n`,
  ]);
};

export const stopAirLift = () => {
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `aC|\n`,
  ]);
};

export const stopAll = () => {
  stopAirLift();
  stopBright();
  stopOptic();
  stopCO2Valve();
  stopCO2PurgeValve();
  stopValve('x')
  stopValve('y')
  stopValve('z')
  stopValve('e')
  // window.electron.serialPort.sendMessage('serial-channel', [
  //   'serial:transfer',
  //   // `eE0D1S0S|\n`,
  //   `bB0B|zE0D1S0S|xE0D1S0S|yE0D1S0S|eE0D1S0S|oO0O|aC|\n`,
  // ]);
};

export const sendCommands = (commands: string) => {
  console.log('SEND COMMAND', `${commands}\n`);
  window.electron.serialPort.sendMessage('serial-channel', [
    'serial:transfer',
    `${commands}\n`,
  ]);
};
