import { SteppersValues, WindowType } from '../Types/Types';

export type SerialDataType =
  | `${SteppersValues}_STEPPER_STOP`
  | 'serial:valve_controller_connected'
  | 'serial:valve_controller_not-found'
  | 'serial:co2_sensor_connected'
  | 'serial:co2_sensor_not-found'
  | 'serial:not-found'
  | 'serial:disconnected';

declare global {
  interface Window {
    electron: WindowType['electron'];
  }
}

export {};
