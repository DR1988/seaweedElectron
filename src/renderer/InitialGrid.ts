import { EItemType, Grid as GridType } from '../Types/Types';

export const initialGrid: GridType = [
  {
    name: 'Stepper',
    id: 'x',
    type: EItemType.Stepper,
    shortName: 'STEP_X',
    changes: [
      {
        startTime: 0,
        volume: 2,
        direction: 'clockwise',
        type: EItemType.Stepper,
        id: 0,
        endTime: 0,
        line: 'x',
      },

      // {
      //   startTime: 9,
      //   volume: 1,
      //   direction: 'clockwise',
      //   type: EItemType.Stepper,
      //   id: 1,
      //   endTime: 0,
      //   line: 'x',
      // },
      //
      // {
      //   startTime: 19,
      //   volume: 2,
      //   direction: 'clockwise',
      //   type: EItemType.Stepper,
      //   id: 2,
      //   endTime: 0,
      //   line: 'x',
      // },
    ],
    description: 'Включает клапан X',
  },
  {
    name: 'Stepper',
    id: 'y',
    type: EItemType.Stepper,
    shortName: 'STEP_Y',
    changes: [
      {
        startTime: 2,
        volume: 3,
        direction: 'clockwise',
        type: EItemType.Stepper,
        id: 0,
        endTime: 0,
        line: 'y',
      },

      // {
      //   startTime: 12,
      //   volume: 3,
      //   direction: 'clockwise',
      //   type: EItemType.Stepper,
      //   id: 1,
      //   endTime: 20,
      //   line: 'y',
      // },
    ],
    description: 'Включает клапан Y',
  },

  {
    name: 'Stepper',
    id: 'z',
    type: EItemType.Stepper,
    shortName: 'STEP_Z',
    changes: [
      {
        startTime: 0,
        volume: 2,
        direction: 'clockwise',
        type: EItemType.Stepper,
        id: 0,
        endTime: 0,
        line: 'z',
      },
      {
        startTime: 23,
        volume: 2,
        direction: 'clockwise',
        type: EItemType.Stepper,
        id: 1,
        endTime: 0,
        line: 'z',
      },
    ],
    description: 'Включает клапан Z',
  },
  {
    name: 'Stepper',
    id: 'e',
    type: EItemType.Stepper,
    shortName: 'STEP_E',
    changes: [
      {
        startTime: 4,
        volume: 4,
        direction: 'clockwise',
        type: EItemType.Stepper,
        id: 0,
        endTime: 0,
        line: 'e',
      },
    ],
    description: 'Включает клапан E',
  },

  {
    name: 'Air Lift',
    id: 'a',
    type: EItemType.AirLift,
    shortName: 'Компрессор',
    changes: [
      {
        id: 1,
        startTime: 0,
        endTime: 2,
        type: EItemType.AirLift,
        line: 'a',
      },
      {
        id: 2,
        startTime: 4,
        endTime: 6,
        type: EItemType.AirLift,
        line: 'a',
      },
      {
        id: 3,
        startTime: 8,
        endTime: 12,
        type: EItemType.AirLift,
        line: 'a',
      },
    ],
    description: 'Включение и выключение воздушного компрессора',
  },

  {
    name: 'Optic Measurement',
    id: 'o',
    type: EItemType.OptoAcc,
    shortName: 'Оптический измеритель',
    changes: [
      {
        id: 1,
        startTime: 0,
        endTime: 2,
        type: EItemType.OptoAcc,
        line: 'o',
      },

      {
        id: 2,
        startTime: 1230,
        endTime: 1231,
        type: EItemType.OptoAcc,
        line: 'o',
      },
      // {
      //   id: 2,
      //   startTime: 30,
      //   endTime: 32,
      //   type: EItemType.OptoAcc,
      //   line: 'o',
      // },
    ],
    description: 'Оптический измеритель',
  },
  {
    name: 'Light',
    id: 'l',
    type: EItemType.Light,
    shortName: 'LIGHT',
    changes: [
      // {
      //   startTime: 0,
      //   type: EItemType.Light,
      //   id: 0,
      //   endTime: 3,
      //   line: 'l',
      //   isChangeable: false,
      //   brightness: 5,
      // },
      // {
      //   startTime: 8,
      //   type: EItemType.Light,
      //   id: 1,
      //   endTime: 15,
      //   line: 'l',
      //   isChangeable: true,
      //   brightness: 75,
      //   brightnessEnd: 5,
      // },
      {
        startTime: 4300,
        type: EItemType.Light,
        id: 2,
        endTime: 5500,
        line: 'l',
        isChangeable: true,
        brightness: 5,
        brightnessEnd: 75,
      },
      {
        startTime: 0,
        type: EItemType.Light,
        id: 5,
        endTime: 3600,
        isChangeable: false,
        line: 'l',
        brightness: 10,
      },
      // {
      //   startTime: 45,
      //   type: EItemType.Light,
      //   id: 6,
      //   endTime: 78,
      //   isChangeable: false,
      //   line: 'l',
      //   brightness: 10,
      // },
    ],
    description: 'Включает свет',
  },
];
