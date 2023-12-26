import { Channels, SerialChannel } from '../main/preload';
import { SerialDataType } from '../renderer/preload';
import { InitialValues } from './StorageTypes';

export type Direction = 'clockwise' | 'counterClockwise';

export type ItemType = 'stepper' | 'light';

export const steppers = ['x', 'y', 'z', 'e'] as const;

export type SteppersValues = typeof steppers[number];
export type LightValues = 'l';
export type AirLiftValues = 'a';
export type OptoAccusticValues = 'o';

// export type StepperItemId = `Stepper_${SteppersValues}_${number}`;
// export type LightItemId = `Light_${LightValues}_${number}`;

export type Brightness = number;

export enum EItemType {
  Stepper = 'stepper',
  StepperNew = 'stepper_new',
  Light = 'light',
  LightNew = 'light_new',
  AirLift = 'air_lift',
  OptoAcc = 'opto_accustic',
}

export type Crossing = { crossingValueStart: number; crossingValueEnd: number };

export type StepperItem = {
  startTime: number;
  volume: number;
  direction: Direction;
  type: EItemType.Stepper;
  id: number;
  wrongSign?: string;
  endTime: number;
  line: SteppersValues;
  crossingValueStart?: number;
  crossingValueEnd?: number;
  crosses?: Array<Crossing>;
};

export type LightItem = {
  id: number;
  type: EItemType.Light;
  startTime: number;
  endTime: number;
  brightness: Brightness;
  brightnessEnd?: Brightness;
  line: LightValues;
  wrongSign?: string;
  wrongSignLight?: string;
  crossingValueStart?: number;
  crossingValueEnd?: number;
  crosses?: Array<Crossing>;
  isChangeable: boolean;
};

export type AirLifItem = {
  startTime: number;
  type: EItemType.AirLift;
  id: number;
  wrongSign?: string;
  endTime: number;
  line: AirLiftValues;
  crossingValueStart?: number;
  crossingValueEnd?: number;
  crosses?: Array<Crossing>;
};

export type OptoAccusticItem = {
  startTime: number;
  type: EItemType.OptoAcc;
  id: number;
  wrongSign?: string;
  endTime: number;
  line: OptoAccusticValues;
  crossingValueStart?: number;
  crossingValueEnd?: number;
  crosses?: Array<Crossing>;
};

export type LineTypeStepper = {
  name: 'Stepper';
  type: EItemType.Stepper;
  id: SteppersValues;
  shortName: string;
  changes: Array<StepperItem>;
  description: string;
};

export type LineTypeLight = {
  name: 'Light';
  type: EItemType.Light;
  id: LightValues;
  shortName: string;
  changes: Array<LightItem>;
  description: string;
};

export type LineTypeAirLift = {
  name: 'Air Lift';
  type: EItemType.AirLift;
  id: AirLiftValues;
  shortName: string;
  changes: Array<AirLifItem>;
  description: string;
};

export type LineTypeOptoAccustic = {
  name: 'Optic Measurement';
  type: EItemType.OptoAcc;
  id: OptoAccusticValues;
  shortName: string;
  changes: Array<OptoAccusticItem>;
  description: string;
};

export type Grid = [
  LineTypeStepper,
  LineTypeStepper,
  LineTypeStepper,
  LineTypeStepper,
  LineTypeAirLift,
  LineTypeOptoAccustic,
  LineTypeLight
];

export type CalibrationTypeRecord = Record<SteppersValues, number>;

export type ValueOf<T> = T[keyof T];

export type WindowType = {
  electron: {
    ipcRenderer: {
      sendMessage: ChannelsArgs;
      on: ChannelsCallback;
      once: ChannelsCallback;
    };
    serialPort: {
      sendMessage<T>(channel: SerialChannel, args: T[]): void;
      on<T extends SerialDataType>(
        channel: SerialChannel,
        func: (...args: T[]) => void
      ): () => void;
    };
  };
};

export enum EChannels {
  saveCalibration = 'save-calibration',
  calibrationDataSaved = 'calibration-data-saved',
  loadCalibration = 'load-calibration',
  loadedCalibration = 'loaded-calibration',
  loadInitial = 'load-initial',
  loadedInitial = 'loaded-initial',
  saveInitials = 'save-initials',
  initialsDataSaved = 'initial-data-saved',
  saveProtocol = 'save-protocol',
  saveProtocolFile = 'save-protocol-file',
  loadProtocol = 'load-protocol',
  loadedProtocolData = 'loaded-protocol-data',
}

export type ChannelsArgs = {
  (channel: EChannels.saveCalibration, args: any): void;
  (channel: EChannels.calibrationDataSaved, args: any): void;
  (channel: EChannels.loadCalibration, args: any): void;
  (channel: EChannels.loadedCalibration, args: any): void;
  (channel: EChannels.loadInitial, args: any): void;
  (channel: EChannels.loadedInitial, args: InitialValues): void;
  (channel: EChannels.saveInitials, args: InitialValues): void;
  (channel: EChannels.initialsDataSaved, args: any): void;
  (channel: EChannels.saveProtocol, args: any): void;
  (channel: EChannels.saveProtocolFile, args: string): void;
  (channel: EChannels.loadProtocol): void;
  (channel: EChannels.loadedProtocolData, args: Grid): void;
};

export type unsub = () => void;

export type ChannelsCallback = {
  (channel: EChannels.saveCalibration, listener: (args: any) => void): void;
  (channel: EChannels.loadCalibration, listener: (args: any) => void): void;
  (channel: EChannels.loadedCalibration, listener: (args: any) => void): void;
  (
    channel: EChannels.calibrationDataSaved,
    listener: (args: any) => void
  ): void;
  (channel: EChannels.loadInitial, listener: (args: any) => void): void;
  (
    channel: EChannels.loadedInitial,
    listener: (values: InitialValues) => void
  ): void;
  (
    channel: EChannels.saveInitials,
    listener: (values: InitialValues) => void
  ): void;
  (channel: EChannels.initialsDataSaved, listener: (args: any) => void): void;
  (channel: EChannels.saveProtocol, listener: (args: any) => void): void;
  (channel: EChannels.saveProtocolFile, listener: (args: string) => void): void;
  (channel: EChannels.loadProtocol, listener: (args: any) => void): void;
  (channel: EChannels.loadedProtocolData, listener: (args: Grid) => void): void;
};

export type Connection = 'initial' | 'connecting' | 'connected' | 'not-found';

export type CalibrationValue = {
  steps: number;
  volume: number;
  time: number;
};

export type CalibrationTypeRecordValues = Record<SteppersValues, CalibrationValue>;