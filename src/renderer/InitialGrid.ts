import { Days, EItemType, Grid as GridType, GridDays } from '../Types/Types';

export const initialGrid: GridType = [
  {
    name: 'Насос 1',
    id: 'x',
    type: EItemType.Stepper,
    shortName: 'STEP_X',
    changes: [
      {
        startTime: 0,
        volume: 7,
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
    name: 'Насос 2',
    id: 'y',
    type: EItemType.Stepper,
    shortName: 'STEP_Y',
    changes: [
      {
        startTime: 0,
        volume: 10,
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
    name: 'Насос 3',
    id: 'z',
    type: EItemType.Stepper,
    shortName: 'STEP_Z',
    changes: [
      {
        startTime: 0,
        volume: 9,
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
    name: 'Насос 4',
    id: 'e',
    type: EItemType.Stepper,
    shortName: 'STEP_E',
    changes: [
      {
        startTime: 0,
        volume: 15,
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
        endTime: 120,
        type: EItemType.AirLift,
        line: 'a',
      },
    ],
    description: 'Включение и выключение воздушного компрессора',
  },

  {
    name: 'AUX',
    id: 'o',
    type: EItemType.OptoAcc,
    shortName: 'Оптический измеритель',
    changes: [
      {
        id: 1,
        startTime: 0,
        endTime: 10,
        type: EItemType.OptoAcc,
        line: 'o',
      },

      {
        id: 2,
        startTime: 20,
        endTime: 30,
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
    name: 'Освещение',
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
      // {
      //   startTime: 4300,
      //   type: EItemType.Light,
      //   id: 2,
      //   endTime: 7800,
      //   line: 'l',
      //   isChangeable: true,
      //   brightness: 5,
      //   brightnessEnd: 75,
      // },
      {
        startTime: 0,
        type: EItemType.Light,
        id: 1,
        endTime: 3,
        line: 'l',
        isChangeable: true,
        brightness: 5,
        brightnessEnd: 75,
      },
      {
        startTime: 3,
        type: EItemType.Light,
        id: 5,
        endTime: 7,
        isChangeable: false,
        line: 'l',
        brightness: 75,
      },
      {
        startTime: 7,
        type: EItemType.Light,
        id: 11,
        endTime: 9,
        line: 'l',
        isChangeable: true,
        brightness: 75,
        brightnessEnd: 5,
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

export const initialDays: Days = [0];

export const emptyGrid: GridType = [
  {
    name: 'Насос 1',
    id: 'x',
    type: EItemType.Stepper,
    shortName: 'STEP_X',
    changes: [],
    description: 'Включает клапан X',
  },
  {
    name: 'Насос 2',
    id: 'y',
    type: EItemType.Stepper,
    shortName: 'STEP_Y',
    changes: [],
    description: 'Включает клапан Y',
  },

  {
    name: 'Насос 3',
    id: 'z',
    type: EItemType.Stepper,
    shortName: 'STEP_Z',
    changes: [],
    description: 'Включает клапан Z',
  },
  {
    name: 'Насос 4',
    id: 'e',
    type: EItemType.Stepper,
    shortName: 'STEP_E',
    changes: [],
    description: 'Включает клапан E',
  },

  {
    name: 'Air Lift',
    id: 'a',
    type: EItemType.AirLift,
    shortName: 'Компрессор',
    changes: [],
    description: 'Включение и выключение воздушного компрессора',
  },

  {
    name: 'AUX',
    id: 'o',
    type: EItemType.OptoAcc,
    shortName: 'Оптический измеритель',
    changes: [],
    description: 'Оптический измеритель',
  },
  {
    name: 'Освещение',
    id: 'l',
    type: EItemType.Light,
    shortName: 'LIGHT',
    changes: [],
    description: 'Включает свет',
  },
];

export const initialGridObj: GridDays = [initialGrid];


export const testGrid: GridType = [
  {
    name: 'Насос 1',
    id: 'x',
    type: EItemType.Stepper,
    shortName: 'STEP_X',
    changes: [
      {
        startTime: 0,
        volume: 7,
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
    name: 'Насос 2',
    id: 'y',
    type: EItemType.Stepper,
    shortName: 'STEP_Y',
    changes: [],
    description: 'Включает клапан Y',
  },

  {
    name: 'Насос 3',
    id: 'z',
    type: EItemType.Stepper,
    shortName: 'STEP_Z',
    changes: [],
    description: 'Включает клапан Z',
  },
  {
    name: 'Насос 4',
    id: 'e',
    type: EItemType.Stepper,
    shortName: 'STEP_E',
    changes: [
      {
        startTime: 0,
        volume: 115,
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
        endTime: 10,
        type: EItemType.AirLift,
        line: 'a',
      },
    ],
    description: 'Включение и выключение воздушного компрессора',
  },

  {
    name: 'AUX',
    id: 'o',
    type: EItemType.OptoAcc,
    shortName: 'Оптический измеритель',
    changes: [
      {
        id: 1,
        startTime: 0,
        endTime: 20,
        type: EItemType.OptoAcc,
        line: 'o',
      },
    ],
    description: 'Оптический измеритель',
  },
  {
    name: 'Освещение',
    id: 'l',
    type: EItemType.Light,
    shortName: 'LIGHT',
    changes: [
      {
        startTime: 0,
        type: EItemType.Light,
        id: 2,
        endTime: 7,
        line: 'l',
        isChangeable: true,
        brightness: 5,
        brightnessEnd: 75,
      },
    ],
    description: 'Включает свет',
  },
];
