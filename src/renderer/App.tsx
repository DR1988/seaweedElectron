import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './App.css';
import { Calibration, CalibrationValue } from './Calibration/Calibration';
import { debounce } from 'lodash';
import { GridElement } from './ProtocolWindow/GridElement';
import {
  AirLifItem,
  Brightness,
  CalibrationTypeRecord,
  Connection,
  Crossing,
  EChannels,
  EItemType,
  Grid as GridType,
  LightItem,
  LineTypeAirLift,
  LineTypeLight,
  LineTypeOptoAccustic,
  LineTypeStepper,
  OptoAccusticItem,
  StepperItem,
  SteppersValues,
  CalibrationTypeRecordValues,
} from '../Types/Types';
import cloneDeep from 'lodash/cloneDeep';
import { BrightModal } from './ProtocolWindow/Modals/BrightModal';
import { useToggle } from './helpers/useToggle';
import { StepperModal } from './ProtocolWindow/Modals/StepperModal';
import { CalibrationChecker } from './Calibration/CalibrationChecker';
import { InitialSettings } from './InitialSettings/InitailSettings';
import { InitialValues } from '../Types/StorageTypes';
import { createTheme, Grid, ThemeProvider } from '@mui/material';
import { ConnectionButton } from './Buttons/ConnectionButton';
import { CalibrationButtons } from './Buttons/CalibrationButton';
import { initialGrid } from './InitialGrid';
import { BrightModalNew } from './ProtocolWindow/Modals/BrightModalNew';
import { StepperModalNew } from './ProtocolWindow/Modals/StepperModalNew';
import { AirLiftModalNew } from './ProtocolWindow/Modals/AirLiftModalNew';
import { AirLiftModal } from './ProtocolWindow/Modals/AirLiftModal';
import { OptoAccusticModalNew } from './ProtocolWindow/Modals/OptoAccusticModalNew';
import { OptoAccusticModal } from './ProtocolWindow/Modals/OptoAccusticModal';
import { Co2ChamberControl } from './Co2ChamberControl/Co2ChamberControl';
import { getHoursAndMinutes } from './helpers/getHoursAndMinutes';

const theme = createTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

export default function App() {
  const [initialValues, setInitialValues] = useState<InitialValues>({
    initialVolume: '',
    initialMinCO2Value: '',
    initialMaxCO2Value: '',
  });
  const [start, setStart] = useState(false);
  const [finish, setFinish] = useState(false);

  const [initialValuesSet, setInitialValuesSet] = useState<boolean>(false);

  const [connected, setConnected] = useState<Connection>('initial');
  const [messageValue, setMessageValue] = useState(
    'bB90B|'
    // 'bB50B|'
  );
  const [messageCo2Value, setMessageCo2Value] = useState('@RRDT');

  const [showCalibration, setShowCalibration] = useState(false);
  const [co2ResultValue, setCo2Result] = useState<string | null>(null);
  const [co2ResultArray, setCo2ResultArray] = useState<
    { time: number; value: string }[]
  >([]);
  const [calibrationValuesTime, setCalibrationValuesTime] =
    useState<CalibrationTypeRecord>({
      x: 0,
      y: 0,
      z: 0,
      e: 0,
    });

  const [calibrationValuesProp, setCalibrationValuesProp] = useState<
    CalibrationTypeRecordValues | undefined
  >(undefined);

  const [showModal, setOpenModal, setCloseModal] = useToggle();
  const [newLightModal, setOpenNewLightModal, setCloseNewLightModal] =
    useToggle();
  const [newStepperModal, setOpenNewStepperModal, setCloseNewStepperModal] =
    useToggle();
  const [newAirLiftModal, setOpenNewAirLiftModal, setCloseNewAirLiftModal] =
    useToggle();
  const [
    newOptoAccusticModal,
    setOpenNewOptoAccusticModal,
    setCloseNewOptoAccusticModal,
  ] = useToggle();

  const startTimeRef = useRef<number>(0);
  const calibrationStart = useRef<boolean>(false);

  useEffect(() => {
    let connectedPorts = 0;
    let tryConnectedPorts = 0;
    const unsubscribe = window.electron.serialPort.on(
      'serial-channel',
      (data) => {
        console.log('datadatadata', data);

        if (data === 'serial:valve_controller_connected') {
          connectedPorts++;
          if (connectedPorts >= 2) {
            setConnected('connected');
          }
        } else if (data === 'serial:valve_controller_not-found') {
          tryConnectedPorts++;
          if (tryConnectedPorts >= 2) {
            setConnected('not-found');
          }
        }
        if (data === 'serial:co2_sensor_connected') {
          connectedPorts++;
          if (connectedPorts >= 2) {
            setConnected('connected');
          }
        } else if (data === 'serial:co2_sensor_not-found') {
          tryConnectedPorts++;
          if (tryConnectedPorts >= 2) {
            setConnected('not-found');
          }
        } else if (data === 'serial:disconnected') {
          setConnected('initial');
        } else if (data.includes('_STEPPER_STOP')) {
          if (calibrationStart.current) {
            calibrationStart.current = false;

            const valve = data
              .split('_STEPPER_STOP')[0]
              .toLowerCase()
              .trim() as SteppersValues;
            const endTime = Date.now();
            const totalCalibrationTime = endTime - startTimeRef.current;
            if (valve) {
              setCalibrationValuesProp((prev) => {
                if (prev === undefined) {
                  return {
                    [valve]: { time: totalCalibrationTime / 1000 },
                  };
                }
                return {
                  ...prev,
                  [valve]: {
                    ...prev[valve],
                    time: totalCalibrationTime / 1000,
                  },
                };
              });
            }
          }
        } else if (data.includes('CO2_RESULT')) {
          const co2Result = data.split(':')[1];
          console.log('!APP co2Result:', co2Result);
          setCo2Result(co2Result);
          setCo2ResultArray((prev) => [
            ...prev,
            { time: Date.now(), value: co2Result },
          ]);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage(EChannels.loadInitial, 'ARGS');
    window.electron.ipcRenderer.on(EChannels.loadedInitial, (data) => {
      setInitialValues(data);
      setInitialValuesSet(true);
    });
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage(EChannels.loadCalibration, 'ARGS');
    window.electron.ipcRenderer.on(EChannels.loadedCalibration, (data) => {
      setCalibrationValuesTime(data.calibrationTimePerSecond);
      setCalibrationValuesProp(data.calibrationValues);
    });
  }, []);

  const getPorts = () => {
    setConnected('connecting');
    window.electron.serialPort.sendMessage('serial-channel', [
      'serial:connect',
    ]);
  };

  const disconnect = () => {
    window.electron.serialPort.sendMessage('serial-channel', [
      'serial:disconnect',
    ]);
  };

  const sendData = () => {
    const input = document.getElementById('data');
    console.log('input', input.value);
    // window.electron.serialPort.sendMessage('serial-channel', ['serial:transfer', 'x|1|1|20\n'], );
    window.electron.serialPort.sendMessage('serial-channel', [
      'serial:transfer',
      `${input.value}\n`,
    ]);
  };

  const sendCo2Data = () => {
    const input = document.getElementById('dataCo2');
    console.log('input', input.value);
    // window.electron.serialPort.sendMessage('serial-channel', ['serial:transfer', 'x|1|1|20\n'], );
    window.electron.serialPort.sendMessage('serial-channel', [
      'serialCo2:transfer',
      `${input.value}`,
    ]);
  };

  const [brightness, setBrightness] = useState(0);
  const handleRangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log(event.target.value);
      setBrightness(event.target.value);
      console.log('ln', Math.log(Number(event.target.value)));
      window.electron.serialPort.sendMessage('serial-channel', [
        'serial:transfer',
        `bB${event.target.value}B|\n`,
      ]);
    },
    []
  );

  const debouncedRange = useMemo(
    () => debounce(handleRangeInput, 300),
    [handleRangeInput]
  );

  const disabledConnection =
    connected === 'connecting' || connected === 'connected';

  const [mainGrid, setMainGrid] = useState<GridType>(initialGrid);

  useEffect(() => {
    window.electron.ipcRenderer.on(EChannels.loadedProtocolData, (dataGrid) => {
      setMainGrid(dataGrid);
    });
  }, []);

  const [selectedItem, setSelectedItem] = useState<
    StepperItem | LightItem | AirLifItem | OptoAccusticItem | null
  >(null);

  const previousSelected = useRef<
    StepperItem | LightItem | AirLifItem | OptoAccusticItem | null
  >(null);
  const previousSelectedLine = useRef<
    | LineTypeStepper
    | LineTypeLight
    | LineTypeAirLift
    | LineTypeOptoAccustic
    | null
  >(null);

  const selectItem = (
    newSelectedItem: StepperItem | LightItem | AirLifItem | OptoAccusticItem
  ) => {
    setSelectedItem(newSelectedItem);
    previousSelected.current = { ...newSelectedItem };
    setOpenModal();
  };

  const selectNewLightItem = (selectedLine: LineTypeLight) => {
    const maxId = Math.max(...selectedLine.changes.map((c) => c.id), 0);
    previousSelectedLine.current = { ...selectedLine };

    setSelectedItem({
      id: maxId + 1,
      type: selectedLine.type,
      startTime: 0,
      endTime: 0,
      brightness: 0,
      line: selectedLine.id,
      wrongSign: '',
      crossingValueStart: 0,
      crossingValueEnd: 0,
      isChangeable: false,
    });
    setOpenNewLightModal();
  };

  const selectNewStepperItem = (selectedLine: LineTypeStepper) => {
    const maxId = Math.max(...selectedLine.changes.map((c) => c.id), 0);
    previousSelectedLine.current = { ...selectedLine };

    setSelectedItem({
      id: maxId + 1,
      startTime: 0,
      volume: 0,
      direction: 'clockwise',
      type: selectedLine.type,
      endTime: 0,
      line: selectedLine.id,
      wrongSign: '',
      crossingValueStart: 0,
      crossingValueEnd: 0,
    });
    setOpenNewStepperModal();
  };

  const selectNewAirLiftItem = (selectedLine: LineTypeAirLift) => {
    const maxId = Math.max(...selectedLine.changes.map((c) => c.id), 0);
    previousSelectedLine.current = { ...selectedLine };

    setSelectedItem({
      id: maxId + 1,
      startTime: 0,
      type: selectedLine.type,
      endTime: 0,
      line: selectedLine.id,
      wrongSign: '',
      crossingValueStart: 0,
      crossingValueEnd: 0,
    });

    setOpenNewAirLiftModal();
  };

  const selectNewOptoAccusticItem = (selectedLine: LineTypeOptoAccustic) => {
    const maxId = Math.max(...selectedLine.changes.map((c) => c.id), 0);
    previousSelectedLine.current = { ...selectedLine };

    setSelectedItem({
      id: maxId + 1,
      startTime: 0,
      type: selectedLine.type,
      endTime: 0,
      line: selectedLine.id,
      wrongSign: '',
      crossingValueStart: 0,
      crossingValueEnd: 0,
    });

    setOpenNewOptoAccusticModal();
  };

  const changeStartTime = (newStartTime: number) => {
    if (selectedItem) {
      const itemPosition = mainGrid.reduce(
        (acc, currentItem, lineIndex) => {
          const itemIndex = currentItem.changes.findIndex(
            (item) =>
              item.line === selectedItem.line && item.id === selectedItem.id
          );
          if (itemIndex > -1) {
            return { lineIndex, itemIndex };
          }

          return acc;
        },
        { lineIndex: -1, itemIndex: -1 }
      );

      const { lineIndex, itemIndex } = itemPosition;

      const newSelectedItem = cloneDeep(selectedItem);

      if (
        newSelectedItem.type === EItemType.Light ||
        newSelectedItem.type === EItemType.AirLift ||
        newSelectedItem.type === EItemType.OptoAcc
      ) {
        const lineElements = mainGrid[lineIndex];
        let wrongSign = '';

        const crosses: Array<Crossing> = [];

        lineElements.changes.forEach((c, ind) => {
          const crossing: Crossing = {
            crossingValueStart: 0,
            crossingValueEnd: 0,
          };

          if (
            newSelectedItem.id !== c.id &&
            (newStartTime <= c.startTime || newStartTime < c.endTime) &&
            newSelectedItem.endTime >= c.endTime
          ) {
            crossing.crossingValueStart =
              newStartTime <= c.startTime ? c.startTime : newStartTime;
            if (newSelectedItem.endTime > c.endTime) {
              crossing.crossingValueEnd = c.endTime;
            } else {
              crossing.crossingValueEnd = newSelectedItem.endTime;
            }
            crosses.push(crossing);
          }
        });

        if (crosses.length) {
          wrongSign = 'Есть пересечения с другими элементами';
        }

        newSelectedItem.crosses = crosses;

        if (newStartTime >= newSelectedItem.endTime) {
          wrongSign = 'Время старта должно быть меньше времени окончания';

          mainGrid[lineIndex].changes[itemIndex] = {
            ...newSelectedItem,
            startTime: newStartTime,
            wrongSign,
          };

          setMainGrid([...mainGrid]);
          setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
        }

        mainGrid[lineIndex].changes[itemIndex] = {
          ...newSelectedItem,
          startTime: newStartTime,
          wrongSign: wrongSign,
        };

        setMainGrid([...mainGrid]);
        setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
      }

      if (newSelectedItem.type === EItemType.Stepper) {
        const lineElements = mainGrid[lineIndex];
        let wrongSign = '';
        const crosses: Array<Crossing> = [];

        const calibrationTime = calibrationValuesTime[newSelectedItem.line];
        const newEndTime =
          newStartTime + calibrationTime * newSelectedItem.volume;

        lineElements.changes.forEach((c, ind) => {
          const crossing: Crossing = {
            crossingValueStart: 0,
            crossingValueEnd: 0,
          };

          if (
            newSelectedItem.id !== c.id &&
            (newStartTime <= c.startTime || newStartTime < c.endTime) &&
            (newEndTime >= c.endTime || newEndTime > c.startTime)
          ) {
            crossing.crossingValueStart =
              newStartTime <= c.startTime ? c.startTime : newStartTime;
            if (newEndTime > c.endTime) {
              crossing.crossingValueEnd = c.endTime;
            } else {
              crossing.crossingValueEnd = newEndTime;
            }
            crosses.push(crossing);
          }
        });

        if (crosses.length) {
          wrongSign = 'Есть пересечения с другими элементами';
        }

        newSelectedItem.crosses = crosses;

        mainGrid[lineIndex].changes[itemIndex] = {
          ...newSelectedItem,
          startTime: newStartTime,
          endTime: newEndTime,
          wrongSign: wrongSign,
          crossingValueStart: 0,
          crossingValueEnd: 0,
        };

        setMainGrid([...mainGrid]);
        setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
      }
    }
  };

  const changeVolume = (newVolume: number) => {
    if (selectedItem) {
      const itemPosition = mainGrid.reduce(
        (acc, currentItem, lineIndex) => {
          const itemIndex = currentItem.changes.findIndex(
            (item) =>
              item.line === selectedItem.line && item.id === selectedItem.id
          );
          if (itemIndex > -1) {
            return { lineIndex, itemIndex };
          }

          return acc;
        },
        { lineIndex: -1, itemIndex: -1 }
      );

      const { lineIndex, itemIndex } = itemPosition;

      const newSelectedItem = cloneDeep(selectedItem);

      if (newSelectedItem.type === EItemType.Stepper) {
        const lineElements = mainGrid[lineIndex];
        const crosses: Array<Crossing> = [];

        const calibrationTime = calibrationValuesTime[newSelectedItem.line];
        const newEndTime =
          newSelectedItem.startTime + calibrationTime * newVolume;
        let wrongSign = '';

        lineElements.changes.forEach((c, ind) => {
          const crossing: Crossing = {
            crossingValueStart: 0,
            crossingValueEnd: 0,
          };

          if (
            newSelectedItem.id !== c.id &&
            (newSelectedItem.startTime <= c.startTime ||
              newSelectedItem.startTime < c.endTime) &&
            (newEndTime >= c.endTime || newEndTime > c.startTime)
          ) {
            crossing.crossingValueEnd =
              newEndTime < c.endTime ? newEndTime : c.endTime;
            if (newSelectedItem.startTime > c.startTime) {
              crossing.crossingValueStart = newSelectedItem.startTime;
            } else {
              crossing.crossingValueStart = c.startTime;
            }
            crosses.push(crossing);
          }
        });

        if (crosses.length) {
          wrongSign = 'Есть пересечения с другими элементами';
        }

        const { days: endTimeDays } = getHoursAndMinutes(newEndTime);

        const { days: startTimeDays } = getHoursAndMinutes(
          newSelectedItem.startTime
        );

        if (endTimeDays !== startTimeDays) {
          wrongSign =
            'Время окончания должно быть в тех же сутках, что и время начала';

          mainGrid[lineIndex].changes[itemIndex] = {
            ...newSelectedItem,
            endTime: newEndTime,
            wrongSign,
          };

          setMainGrid([...mainGrid]);
          setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
        }

        newSelectedItem.crosses = crosses;

        if (newEndTime <= newSelectedItem.startTime) {
          wrongSign = 'Время окончания должно быть больше времени старта';

          mainGrid[lineIndex].changes[itemIndex] = {
            ...newSelectedItem,
            volume: newVolume,
            endTime: newEndTime,
            wrongSign,
          };

          setMainGrid([...mainGrid]);
          setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
        } else {
          mainGrid[lineIndex].changes[itemIndex] = {
            ...newSelectedItem,
            endTime: newEndTime,
            volume: newVolume,
            wrongSign: wrongSign,
          };

          setMainGrid([...mainGrid]);
          setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
        }
      }
    }
  };

  const changeEndTime = (newEndTime: number) => {
    if (selectedItem) {
      const itemPosition = mainGrid.reduce(
        (acc, currentItem, lineIndex) => {
          const itemIndex = currentItem.changes.findIndex(
            (item) =>
              item.line === selectedItem.line && item.id === selectedItem.id
          );
          if (itemIndex > -1) {
            return { lineIndex, itemIndex };
          }

          return acc;
        },
        { lineIndex: -1, itemIndex: -1 }
      );

      const { lineIndex, itemIndex } = itemPosition;

      const newSelectedItem = cloneDeep(selectedItem);

      if (
        newSelectedItem.type === EItemType.Light ||
        newSelectedItem.type === EItemType.AirLift ||
        newSelectedItem.type === EItemType.OptoAcc
      ) {
        const lineElements = mainGrid[lineIndex];
        let wrongSign = '';

        const crosses: Array<Crossing> = [];

        lineElements.changes.forEach((c, ind) => {
          const crossing: Crossing = {
            crossingValueStart: 0,
            crossingValueEnd: 0,
          };

          if (
            newSelectedItem.id !== c.id &&
            (newEndTime > c.startTime || newEndTime >= c.endTime) &&
            newSelectedItem.startTime <= c.startTime
          ) {
            crossing.crossingValueEnd =
              newEndTime < c.endTime ? newEndTime : c.endTime;
            if (newSelectedItem.startTime > c.startTime) {
              crossing.crossingValueStart = newSelectedItem.startTime;
            } else {
              crossing.crossingValueStart = c.startTime;
            }
            crosses.push(crossing);
          }
        });

        if (crosses.length) {
          wrongSign = 'Есть пересечения с другими элементами';
        }
        newSelectedItem.crosses = crosses;

        if (newEndTime < newSelectedItem.startTime) {
          wrongSign = 'Время окончания должно быть больше времени старта';

          mainGrid[lineIndex].changes[itemIndex] = {
            ...newSelectedItem,
            endTime: newEndTime,
            wrongSign,
          };

          setMainGrid([...mainGrid]);
          setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
        }

        const { days: endTimeDays } = getHoursAndMinutes(newEndTime);

        const { days: startTimeDays } = getHoursAndMinutes(
          newSelectedItem.startTime
        );

        if (endTimeDays !== startTimeDays) {
          wrongSign =
            'Время окончания должно быть в тех же сутках, что и время начала';

          mainGrid[lineIndex].changes[itemIndex] = {
            ...newSelectedItem,
            endTime: newEndTime,
            wrongSign,
          };

          setMainGrid([...mainGrid]);
          setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
        }

        mainGrid[lineIndex].changes[itemIndex] = {
          ...newSelectedItem,
          endTime: newEndTime,
          wrongSign: wrongSign,
        };

        setMainGrid([...mainGrid]);
        setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
      }
    }
  };

  const changeBrightness = (newBrightValue: Brightness) => {
    if (selectedItem) {
      const itemPosition = mainGrid.reduce(
        (acc, currentItem, lineIndex) => {
          const itemIndex = currentItem.changes.findIndex(
            (item) =>
              item.line === selectedItem.line && item.id === selectedItem.id
          );
          if (itemIndex > -1) {
            return { lineIndex, itemIndex };
          }

          return acc;
        },
        { lineIndex: -1, itemIndex: -1 }
      );

      if (selectedItem?.type === EItemType.Light) {
        let wrongSign = '';

        if (newBrightValue === selectedItem.brightnessEnd) {
          wrongSign = 'Начальные и конечные значения яркости должны отличаться';
        }

        const { lineIndex, itemIndex } = itemPosition;

        const newSelectedItem = cloneDeep(selectedItem);

        if (newSelectedItem.type === EItemType.Light) {
          mainGrid[lineIndex].changes[itemIndex] = {
            ...newSelectedItem,
            brightness: newBrightValue,
            wrongSignLight: wrongSign,
          };

          setMainGrid([...mainGrid]);
          setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
        }
      }
    }
  };

  const changeEndBrightness = (newBrightValue: Brightness) => {
    if (selectedItem) {
      const itemPosition = mainGrid.reduce(
        (acc, currentItem, lineIndex) => {
          const itemIndex = currentItem.changes.findIndex(
            (item) =>
              item.line === selectedItem.line && item.id === selectedItem.id
          );
          if (itemIndex > -1) {
            return { lineIndex, itemIndex };
          }

          return acc;
        },
        { lineIndex: -1, itemIndex: -1 }
      );

      if (selectedItem?.type === EItemType.Light) {
        let wrongSign = '';

        if (selectedItem.brightness === newBrightValue) {
          wrongSign = 'Начальные и конечные значения яркости должны отличаться';
        }

        const { lineIndex, itemIndex } = itemPosition;

        const newSelectedItem = cloneDeep(selectedItem);

        if (newSelectedItem.type === EItemType.Light) {
          mainGrid[lineIndex].changes[itemIndex] = {
            ...newSelectedItem,
            brightnessEnd: newBrightValue,
            wrongSignLight: wrongSign,
          };

          setMainGrid([...mainGrid]);
          setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
        }
      }
    }
  };

  const resetToPreviousChanges = () => {
    if (previousSelected.current) {
      const itemPosition = mainGrid.reduce(
        (acc, currentItem, lineIndex) => {
          const itemIndex = currentItem.changes.findIndex(
            (item) =>
              item.line === previousSelected.current?.line &&
              item.id === previousSelected.current?.id
          );
          if (itemIndex > -1) {
            return { lineIndex, itemIndex };
          }

          return acc;
        },
        { lineIndex: -1, itemIndex: -1 }
      );

      const { lineIndex, itemIndex } = itemPosition;
      mainGrid[lineIndex].changes[itemIndex] = {
        ...previousSelected.current,
        wrongSign: '',
      };

      setMainGrid([...mainGrid]);
      setSelectedItem({ ...mainGrid[lineIndex].changes[itemIndex] });
    }
  };

  const removeCurrentItem = () => {
    const lineIndex = mainGrid.findIndex(
      (element) => element.id === selectedItem?.line
    );
    const line = mainGrid[lineIndex];

    const filteredChanges = line.changes.filter(
      (c) => c.id !== selectedItem?.id
    );

    mainGrid[lineIndex] = { ...line, changes: filteredChanges };

    setMainGrid([...mainGrid]);
    setSelectedItem(null);
  };

  const changeNewStartTime = (newStartTime: number) => {
    const lineIndex = mainGrid.findIndex(
      (element) => element.id === selectedItem?.line
    );
    const line = mainGrid[lineIndex];
    const newSelectedItem = cloneDeep(selectedItem);
    const crosses: Array<Crossing> = [];

    let hasIntersection = false;
    line.changes.forEach((c) => {
      if (
        newStartTime >= c.startTime &&
        newStartTime < c.endTime &&
        newSelectedItem?.id !== c.id
      ) {
        hasIntersection = true;
      }
    });

    let wrongSign = hasIntersection ? 'Время начало имеет пересечения' : '';

    if (line && newSelectedItem && newSelectedItem?.type === EItemType.Light) {
      if (newSelectedItem?.endTime) {
        if (newStartTime >= newSelectedItem.endTime) {
          wrongSign = 'Время старта больше или равно времени окончания';
        }
        line.changes.forEach((c, ind) => {
          const crossing: Crossing = {
            crossingValueStart: 0,
            crossingValueEnd: 0,
          };

          if (
            newSelectedItem.id !== c.id &&
            (newStartTime <= c.startTime || newStartTime < c.endTime) &&
            newSelectedItem.endTime >= c.endTime
          ) {
            crossing.crossingValueStart =
              newStartTime <= c.startTime ? c.startTime : newStartTime;
            if (newSelectedItem.endTime > c.endTime) {
              crossing.crossingValueEnd = c.endTime;
            } else {
              crossing.crossingValueEnd = newSelectedItem.endTime;
            }
            crosses.push(crossing);
          }
        });
      }

      newSelectedItem.crosses = crosses;

      if (crosses.length) {
        wrongSign = 'Есть пересечения с другими элементами';
      }

      const element = {
        ...newSelectedItem,
        startTime: newStartTime,
        wrongSign,
      } as LightItem;

      const index = mainGrid[lineIndex].changes.findIndex(
        (c) => c.id === element.id
      );

      if (index === -1) {
        (mainGrid[lineIndex].changes as LightItem[]) = [
          ...mainGrid[lineIndex].changes,
          element,
        ];
      } else {
        mainGrid[lineIndex].changes[index] = element;
      }

      setMainGrid([...mainGrid]);
      setSelectedItem({ ...element });
    }

    if (
      line &&
      newSelectedItem &&
      newSelectedItem?.type === EItemType.OptoAcc
    ) {
      if (newSelectedItem?.endTime) {
        if (newStartTime >= newSelectedItem.endTime) {
          wrongSign = 'Время старта больше или равно времени окончания';
        }
        line.changes.forEach((c, ind) => {
          const crossing: Crossing = {
            crossingValueStart: 0,
            crossingValueEnd: 0,
          };

          if (
            newSelectedItem.id !== c.id &&
            (newStartTime <= c.startTime || newStartTime < c.endTime) &&
            newSelectedItem.endTime >= c.endTime
          ) {
            crossing.crossingValueStart =
              newStartTime <= c.startTime ? c.startTime : newStartTime;
            if (newSelectedItem.endTime > c.endTime) {
              crossing.crossingValueEnd = c.endTime;
            } else {
              crossing.crossingValueEnd = newSelectedItem.endTime;
            }
            crosses.push(crossing);
          }
        });
      }

      newSelectedItem.crosses = crosses;

      if (crosses.length) {
        wrongSign = 'Есть пересечения с другими элементами';
      }

      const element = {
        ...newSelectedItem,
        startTime: newStartTime,
        wrongSign,
      } as OptoAccusticItem;

      const index = mainGrid[lineIndex].changes.findIndex(
        (c) => c.id === element.id
      );

      if (index === -1) {
        (mainGrid[lineIndex].changes as OptoAccusticItem[]) = [
          ...mainGrid[lineIndex].changes,
          element,
        ];
      } else {
        mainGrid[lineIndex].changes[index] = element;
      }

      setMainGrid([...mainGrid]);
      setSelectedItem({ ...element });
    }

    if (
      line &&
      newSelectedItem &&
      newSelectedItem?.type === EItemType.AirLift
    ) {
      if (newSelectedItem?.endTime) {
        if (newStartTime >= newSelectedItem.endTime) {
          wrongSign = 'Время старта больше или равно времени окончания';
        }
        line.changes.forEach((c, ind) => {
          const crossing: Crossing = {
            crossingValueStart: 0,
            crossingValueEnd: 0,
          };

          if (
            newSelectedItem.id !== c.id &&
            (newStartTime <= c.startTime || newStartTime < c.endTime) &&
            newSelectedItem.endTime >= c.endTime
          ) {
            crossing.crossingValueStart =
              newStartTime <= c.startTime ? c.startTime : newStartTime;
            if (newSelectedItem.endTime > c.endTime) {
              crossing.crossingValueEnd = c.endTime;
            } else {
              crossing.crossingValueEnd = newSelectedItem.endTime;
            }
            crosses.push(crossing);
          }
        });
      }

      newSelectedItem.crosses = crosses;

      if (crosses.length) {
        wrongSign = 'Есть пересечения с другими элементами';
      }

      const element = {
        ...newSelectedItem,
        startTime: newStartTime,
        wrongSign,
      } as AirLifItem;

      const index = mainGrid[lineIndex].changes.findIndex(
        (c) => c.id === element.id
      );

      if (index === -1) {
        (mainGrid[lineIndex].changes as AirLifItem[]) = [
          ...mainGrid[lineIndex].changes,
          element,
        ];
      } else {
        mainGrid[lineIndex].changes[index] = element;
      }

      setMainGrid([...mainGrid]);
      setSelectedItem({ ...element });
    }

    if (
      line.type === EItemType.Stepper &&
      newSelectedItem &&
      newSelectedItem.type === EItemType.Stepper
    ) {
      const calibrationTime = calibrationValuesTime[newSelectedItem.line];
      const newEndTime =
        newStartTime + calibrationTime * newSelectedItem.volume;

      if (newSelectedItem?.endTime) {
        if (newStartTime > newEndTime) {
          wrongSign = 'Время старта больше времени окончания';
        }
        line.changes.forEach((c, ind) => {
          const crossing: Crossing = {
            crossingValueStart: 0,
            crossingValueEnd: 0,
          };

          if (
            newSelectedItem.id !== c.id &&
            (newStartTime <= c.startTime || newStartTime < c.endTime) &&
            (newEndTime >= c.endTime || newEndTime > c.startTime)
          ) {
            crossing.crossingValueStart =
              newStartTime <= c.startTime ? c.startTime : newStartTime;
            if (newEndTime > c.endTime) {
              crossing.crossingValueEnd = c.endTime;
            } else {
              crossing.crossingValueEnd = newEndTime;
            }
            crosses.push(crossing);
          }
        });
      }

      newSelectedItem.crosses = crosses;

      if (crosses.length) {
        wrongSign = 'Есть пересечения с другими элементами';
      }

      const element = {
        ...newSelectedItem,
        startTime: newStartTime,
        endTime: newEndTime,
        wrongSign,
      };

      const index = mainGrid[lineIndex].changes.findIndex(
        (c) => c.id === element.id
      );

      if (index === -1) {
        mainGrid[lineIndex].changes = [...mainGrid[lineIndex].changes, element];
      } else {
        mainGrid[lineIndex].changes[index] = element;
      }

      setMainGrid([...mainGrid]);
      setSelectedItem({ ...element });
    }
  };

  const changeNewEndTime = (newEndTime: number) => {
    const lineIndex = mainGrid.findIndex(
      (element) => element.id === selectedItem?.line
    );
    const line = mainGrid[lineIndex];
    const newSelectedItem = cloneDeep(selectedItem);

    const { days: endTimeDays } = getHoursAndMinutes(newEndTime);

    const { days: startTimeDays } = getHoursAndMinutes(
      newSelectedItem.startTime
    );

    if (line && newSelectedItem) {
      if (line.type === EItemType.Light) {
        let hasIntersection = false;
        line.changes.forEach((c) => {
          if (
            newEndTime <= c.endTime &&
            newEndTime > c.startTime &&
            newSelectedItem.id !== c.id
          ) {
            hasIntersection = true;
          }
        });

        let wrongSign = hasIntersection
          ? 'Время окончания имеет пересечения'
          : '';

        const crosses: Array<Crossing> = [];

        if (newSelectedItem?.startTime !== undefined) {
          if (newEndTime <= newSelectedItem.startTime) {
            wrongSign = 'Время окончания меньше или равно времени начала';
          }
          line.changes.forEach((c) => {
            const crossing: Crossing = {
              crossingValueStart: 0,
              crossingValueEnd: 0,
            };

            if (
              newSelectedItem.id !== c.id &&
              (newEndTime > c.startTime || newEndTime >= c.endTime) &&
              (newSelectedItem.startTime <= c.startTime ||
                newSelectedItem.startTime <= c.endTime)
            ) {
              crossing.crossingValueEnd =
                newEndTime < c.endTime ? newEndTime : c.endTime;
              if (newSelectedItem.startTime > c.startTime) {
                crossing.crossingValueStart = newSelectedItem.startTime;
              } else {
                crossing.crossingValueStart = c.startTime;
              }
              crosses.push(crossing);
            }
          });
        }

        if (crosses.length) {
          wrongSign = 'Есть пересечения с другими элементами';
        }
        newSelectedItem.crosses = crosses;

        let element = {
          ...newSelectedItem,
          endTime: newEndTime,
          wrongSign,
        } as LightItem;

        const index = mainGrid[lineIndex].changes.findIndex(
          (c) => c.id === element.id
        );

        if (index === -1) {
          mainGrid[lineIndex].changes = [
            ...mainGrid[lineIndex].changes,
            element,
          ];
        } else {
          mainGrid[lineIndex].changes[index] = element;
        }

        if (endTimeDays !== startTimeDays) {
          wrongSign =
            'Время окончания должно быть в тех же сутках, что и время начала';

          element = {
            ...newSelectedItem,
            endTime: newEndTime,
            wrongSign,
          } as LightItem;

          const index = mainGrid[lineIndex].changes.findIndex(
            (c) => c.id === element.id
          );

          if (index === -1) {
            mainGrid[lineIndex].changes = [
              ...mainGrid[lineIndex].changes,
              element,
            ];
          } else {
            mainGrid[lineIndex].changes[index] = element;
          }
        }

        setMainGrid([...mainGrid]);
        setSelectedItem({ ...element });
      }
      if (line.type === EItemType.AirLift) {
        let hasIntersection = false;
        line.changes.forEach((c) => {
          if (
            newEndTime <= c.endTime &&
            newEndTime > c.startTime &&
            newSelectedItem.id !== c.id
          ) {
            hasIntersection = true;
          }
        });

        let wrongSign = hasIntersection
          ? 'Время окончания имеет пересечения'
          : '';

        const crosses: Array<Crossing> = [];

        if (newSelectedItem?.startTime !== undefined) {
          if (newEndTime <= newSelectedItem.startTime) {
            wrongSign = 'Время окончания меньше или равно времени начала';
          }
          line.changes.forEach((c) => {
            const crossing: Crossing = {
              crossingValueStart: 0,
              crossingValueEnd: 0,
            };

            if (
              newSelectedItem.id !== c.id &&
              (newEndTime > c.startTime || newEndTime >= c.endTime) &&
              (newSelectedItem.startTime <= c.startTime ||
                newSelectedItem.startTime <= c.endTime)
            ) {
              crossing.crossingValueEnd =
                newEndTime < c.endTime ? newEndTime : c.endTime;
              if (newSelectedItem.startTime > c.startTime) {
                crossing.crossingValueStart = newSelectedItem.startTime;
              } else {
                crossing.crossingValueStart = c.startTime;
              }
              crosses.push(crossing);
            }
          });
        }

        if (crosses.length) {
          wrongSign = 'Есть пересечения с другими элементами';
        }
        newSelectedItem.crosses = crosses;

        let element = {
          ...newSelectedItem,
          endTime: newEndTime,
          wrongSign,
        } as AirLifItem;

        const index = mainGrid[lineIndex].changes.findIndex(
          (c) => c.id === element.id
        );

        if (index === -1) {
          mainGrid[lineIndex].changes = [
            ...mainGrid[lineIndex].changes,
            element,
          ];
        } else {
          mainGrid[lineIndex].changes[index] = element;
        }

        if (endTimeDays !== startTimeDays) {
          wrongSign =
            'Время окончания должно быть в тех же сутках, что и время начала';

          element = {
            ...newSelectedItem,
            endTime: newEndTime,
            wrongSign,
          } as AirLifItem;

          const index = mainGrid[lineIndex].changes.findIndex(
            (c) => c.id === element.id
          );

          if (index === -1) {
            mainGrid[lineIndex].changes = [
              ...mainGrid[lineIndex].changes,
              element,
            ];
          } else {
            mainGrid[lineIndex].changes[index] = element;
          }
        }

        setMainGrid([...mainGrid]);
        setSelectedItem({ ...element });
      }
      if (line.type === EItemType.OptoAcc) {
        let hasIntersection = false;
        line.changes.forEach((c) => {
          if (
            newEndTime <= c.endTime &&
            newEndTime > c.startTime &&
            newSelectedItem.id !== c.id
          ) {
            hasIntersection = true;
          }
        });

        let wrongSign = hasIntersection
          ? 'Время окончания имеет пересечения'
          : '';

        const crosses: Array<Crossing> = [];

        if (newSelectedItem?.startTime !== undefined) {
          if (newEndTime <= newSelectedItem.startTime) {
            wrongSign = 'Время окончания меньше или равно времени начала';
          }
          line.changes.forEach((c) => {
            const crossing: Crossing = {
              crossingValueStart: 0,
              crossingValueEnd: 0,
            };

            if (
              newSelectedItem.id !== c.id &&
              (newEndTime > c.startTime || newEndTime >= c.endTime) &&
              (newSelectedItem.startTime <= c.startTime ||
                newSelectedItem.startTime <= c.endTime)
            ) {
              crossing.crossingValueEnd =
                newEndTime < c.endTime ? newEndTime : c.endTime;
              if (newSelectedItem.startTime > c.startTime) {
                crossing.crossingValueStart = newSelectedItem.startTime;
              } else {
                crossing.crossingValueStart = c.startTime;
              }
              crosses.push(crossing);
            }
          });
        }

        if (crosses.length) {
          wrongSign = 'Есть пересечения с другими элементами';
        }
        newSelectedItem.crosses = crosses;

        let element = {
          ...newSelectedItem,
          endTime: newEndTime,
          wrongSign,
        } as OptoAccusticItem;

        const index = mainGrid[lineIndex].changes.findIndex(
          (c) => c.id === element.id
        );

        if (index === -1) {
          mainGrid[lineIndex].changes = [
            ...mainGrid[lineIndex].changes,
            element,
          ];
        } else {
          mainGrid[lineIndex].changes[index] = element;
        }

        if (endTimeDays !== startTimeDays) {
          wrongSign =
            'Время окончания должно быть в тех же сутках, что и время начала';

          element = {
            ...newSelectedItem,
            endTime: newEndTime,
            wrongSign,
          } as OptoAccusticItem;

          const index = mainGrid[lineIndex].changes.findIndex(
            (c) => c.id === element.id
          );

          if (index === -1) {
            mainGrid[lineIndex].changes = [
              ...mainGrid[lineIndex].changes,
              element,
            ];
          } else {
            mainGrid[lineIndex].changes[index] = element;
          }
        }

        setMainGrid([...mainGrid]);
        setSelectedItem({ ...element });
      }
    }
  };

  const changeBrightnessNew = (newBrightValue: Brightness) => {
    const lineIndex = mainGrid.findIndex(
      (element) => element.id === selectedItem?.line
    );
    const line = mainGrid[lineIndex];

    if (line) {
      const newSelectedItem = cloneDeep(selectedItem);

      if (
        line.type === EItemType.Light &&
        newSelectedItem?.type === EItemType.Light
      ) {
        let wrongSign = '';

        if (newBrightValue === newSelectedItem.brightnessEnd) {
          wrongSign = 'Начальные и конечные значения яркости должны отличаться';
        }

        const element = {
          ...newSelectedItem,
          wrongSignLight: wrongSign,
          brightness: newBrightValue,
        } as LightItem;

        const index = mainGrid[lineIndex].changes.findIndex(
          (c) => c.id === element.id
        );

        if (index === -1) {
          mainGrid[lineIndex].changes = [
            ...mainGrid[lineIndex].changes,
            element,
          ];
        } else {
          mainGrid[lineIndex].changes[index] = element;
        }
        setMainGrid([...mainGrid]);
        setSelectedItem({ ...element });
      }
    }
  };

  const changeEndBrightnessNew = (newBrightValue: Brightness) => {
    const lineIndex = mainGrid.findIndex(
      (element) => element.id === selectedItem?.line
    );
    const line = mainGrid[lineIndex];

    if (line) {
      const newSelectedItem = cloneDeep(selectedItem);

      if (
        line.type === EItemType.Light &&
        newSelectedItem?.type === EItemType.Light
      ) {
        let wrongSign = '';

        if (newBrightValue === newSelectedItem?.brightness) {
          wrongSign = 'Начальные и конечные значения яркости должны отличаться';
        }

        const element = {
          ...newSelectedItem,
          wrongSignLight: wrongSign,
          brightnessEnd: newBrightValue,
        } as LightItem;

        const index = mainGrid[lineIndex].changes.findIndex(
          (c) => c.id === element.id
        );

        if (index === -1) {
          mainGrid[lineIndex].changes = [
            ...mainGrid[lineIndex].changes,
            element,
          ];
        } else {
          mainGrid[lineIndex].changes[index] = element;
        }
        setMainGrid([...mainGrid]);
        setSelectedItem({ ...element });
      }
    }
  };

  const swapChangeable = (value: boolean) => {
    const lineIndex = mainGrid.findIndex(
      (element) => element.id === selectedItem?.line
    );
    const line = mainGrid[lineIndex];

    if (line) {
      if (line.type === EItemType.Light) {
        const newSelectedItem = cloneDeep(selectedItem);

        const element = {
          ...newSelectedItem,
          brightnessEnd: undefined,
          isChangeable: value,
        } as LightItem;

        const index = mainGrid[lineIndex].changes.findIndex(
          (c) => c.id === element.id
        );

        if (index === -1) {
          mainGrid[lineIndex].changes = [
            ...mainGrid[lineIndex].changes,
            element,
          ];
        } else {
          mainGrid[lineIndex].changes[index] = element;
        }
        setMainGrid([...mainGrid]);
        setSelectedItem({ ...element });
      }
    }
  };

  const resetToPreviousChangesNew = () => {
    if (previousSelectedLine.current) {
      const index = mainGrid.findIndex(
        (element) => element.id === previousSelectedLine.current?.id
      );

      if (index > -1) {
        mainGrid[index] = previousSelectedLine.current;
        setMainGrid([...mainGrid]);
        setSelectedItem(null);
      }
    }
  };

  const changeNewVolume = (newVolume: number) => {
    const newSelectedItem = cloneDeep(selectedItem);

    const lineIndex = mainGrid.findIndex(
      (element) => element.id === selectedItem?.line
    );
    const line = mainGrid[lineIndex];

    if (line) {
      if (
        line.type === EItemType.Stepper &&
        newSelectedItem &&
        newSelectedItem.type === EItemType.Stepper
      ) {
        const time = calibrationValuesTime[newSelectedItem.line];
        const newEndTime = newSelectedItem.startTime + time * newVolume;

        let hasIntersection = false;
        line.changes.forEach((c) => {
          if (
            newSelectedItem.id !== c.id &&
            newEndTime < c.endTime &&
            newEndTime > c.startTime
          ) {
            hasIntersection = true;
          }
        });

        let wrongSign = hasIntersection
          ? 'Время окончания имеет пересечения'
          : '';

        const crosses: Array<Crossing> = [];

        line.changes.forEach((c, ind) => {
          const crossing: Crossing = {
            crossingValueStart: 0,
            crossingValueEnd: 0,
          };

          if (
            newSelectedItem.id !== c.id &&
            (newSelectedItem.startTime <= c.startTime ||
              newSelectedItem.startTime < c.endTime) &&
            (newEndTime >= c.endTime || newEndTime > c.startTime)
          ) {
            crossing.crossingValueEnd =
              newEndTime < c.endTime ? newEndTime : c.endTime;
            if (newSelectedItem.startTime > c.startTime) {
              crossing.crossingValueStart = newSelectedItem.startTime;
            } else {
              crossing.crossingValueStart = c.startTime;
            }
            crosses.push(crossing);
          }
        });

        if (crosses.length) {
          wrongSign = 'Есть пересечения с другими элементами';
        }

        newSelectedItem.crosses = crosses;

        let element = {
          ...newSelectedItem,
          volume: newVolume,
          endTime: newEndTime,
          wrongSign,
        } as StepperItem;

        const index = mainGrid[lineIndex].changes.findIndex(
          (c) => c.id === element.id
        );

        if (index === -1) {
          mainGrid[lineIndex].changes = [
            ...mainGrid[lineIndex].changes,
            element,
          ];
        } else {
          mainGrid[lineIndex].changes[index] = element;
        }

        const { days: endTimeDays } = getHoursAndMinutes(newEndTime);

        const { days: startTimeDays } = getHoursAndMinutes(
          newSelectedItem.startTime
        );

        if (endTimeDays !== startTimeDays) {
          wrongSign =
            'Время окончания должно быть в тех же сутках, что и время начала';

          element = {
            ...newSelectedItem,
            volume: newVolume,
            endTime: newEndTime,
            wrongSign,
          } as StepperItem;

          const index = mainGrid[lineIndex].changes.findIndex(
            (c) => c.id === element.id
          );

          if (index === -1) {
            mainGrid[lineIndex].changes = [
              ...mainGrid[lineIndex].changes,
              element,
            ];
          } else {
            mainGrid[lineIndex].changes[index] = element;
          }
        }

        setMainGrid([...mainGrid]);
        setSelectedItem({ ...element });
      }
    }
  };

  useEffect(() => {
    const calibratedGrid = mainGrid.map((gridElement) => {
      if (gridElement.type === EItemType.Stepper) {
        const calibrationTime = calibrationValuesTime[gridElement.id];

        const newChanges = gridElement.changes.map((c) => {
          return { ...c, endTime: c.startTime + c.volume * calibrationTime };
        });

        return {
          ...gridElement,
          changes: newChanges,
        };
      }

      return gridElement;
    });

    setMainGrid(calibratedGrid);
  }, [calibrationValuesTime]);

  const saveInitialValues = (key: keyof InitialValues, value: string) => {
    setInitialValues((prev) => {
      return { ...prev, [key]: value };
    });
  };

  const saveValues = () => {
    window.electron.ipcRenderer.sendMessage(
      EChannels.saveInitials,
      initialValues
    );
  };

  const isInitialValueSet = () => {
    return Object.values(initialValues).every((value) => !!value);
  };

  const shouldShowForm = isInitialValueSet();

  return (
    <ThemeProvider theme={theme}>
      <Grid height="100%">
        <Grid
          container
          xs={12}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <ConnectionButton
            disabledConnection={disabledConnection}
            getPorts={getPorts}
            connected={connected}
            disconnect={disconnect}
          />

          <CalibrationButtons
            setShowCalibration={setShowCalibration}
            showCalibration={showCalibration}
          />
        </Grid>

        {/*<div>*/}
        {/*  <input*/}
        {/*    style={{ width: 400, height: 60, fontSize: 20 }}*/}
        {/*    onChange={(e) => setMessageValue(e.currentTarget.value)}*/}
        {/*    id="data"*/}
        {/*    value={messageValue}*/}
        {/*  />*/}
        {/*  <button onClick={sendData}>Send data</button>*/}
        {/*</div>*/}
        <div>
          {/* <h3>Co2 message</h3>
         <input
            style={{ width: 400, height: 60, fontSize: 20 }}
            onChange={(e) => setMessageCo2Value(e.currentTarget.value)}
            id="dataCo2"
            value={messageCo2Value}
          />
         <button onClick={sendCo2Data}>Send data</button> */}
          {co2ResultValue && <h2>Result Co2: {co2ResultValue}</h2>}
        </div>

        <InitialSettings
          initialValues={initialValues}
          setInitialValues={saveInitialValues}
          saveValues={saveValues}
          initialValuesSet={initialValuesSet}
        />

        <Co2ChamberControl
          initialValues={initialValues}
          co2Value={co2ResultValue}
          connection={connected}
        />

        <section style={{ visibility: shouldShowForm ? 'visible' : 'hidden' }}>
          {/* <div
            style={{ display: 'flex', flexDirection: 'column', paddingTop: 20 }}
          >
            <label htmlFor="bright">Яркость: {brightness}</label>
            <input
              style={{ width: 1000, height: 20, fontSize: 20 }}
              onChange={debouncedRange}
              step={0.1}
              type="range"
              id="bright"
              name="bright"
              min="0"
              max="100"
            />
          </div> */}

          <Calibration
            showCalibration={showCalibration}
            closeCalibration={setShowCalibration}
            calibrate={(id, steps) => {
              startTimeRef.current = Date.now();
              calibrationStart.current = true;

              try {
                window.electron.serialPort.sendMessage('serial-channel', [
                  'serial:transfer',
                  `${id}E1D1S${steps}S|\n`,
                ]);
              } catch (e) {
                console.log('EEEEE', e);
              }
            }}
            calibrationValues={calibrationValuesProp}
            changeCalibrationValue={setCalibrationValuesProp}
          />

          <CalibrationChecker calibrationValues={calibrationValuesProp || {}} />

          {/*{!isEmptyCalibrationValues(calibrationValuesTime) ? (*/}

          <GridElement
            grid={mainGrid}
            selectItem={selectItem}
            selectNewLightItem={selectNewLightItem}
            selectNewStepperItem={selectNewStepperItem}
            selectNewAirLiftItem={selectNewAirLiftItem}
            selectNewOptoAccustic={selectNewOptoAccusticItem}
            calibrationValuesTime={calibrationValuesTime}
            start={start}
            setStart={setStart}
            finish={finish}
            setFinish={setFinish}
          />

          {/*) : null}*/}

          {showModal && selectedItem?.type === EItemType.Light && (
            <BrightModal
              selectedItem={selectedItem}
              closeModal={setCloseModal}
              changeStartTime={changeStartTime}
              changeEndTime={changeEndTime}
              changeBrightness={changeBrightness}
              resetToPreviousChanges={resetToPreviousChanges}
              removeCurrentItem={removeCurrentItem}
              swapChangeable={swapChangeable}
              changeEndBrightness={changeEndBrightness}
            />
          )}

          {showModal && selectedItem?.type === EItemType.Stepper && (
            <StepperModal
              selectedItem={selectedItem}
              closeModal={setCloseModal}
              changeStartTime={changeStartTime}
              changeVolume={changeVolume}
              resetToPreviousChanges={resetToPreviousChanges}
              removeCurrentItem={removeCurrentItem}
            />
          )}

          {showModal && selectedItem?.type === EItemType.AirLift && (
            <AirLiftModal
              selectedItem={selectedItem}
              closeModal={setCloseModal}
              changeStartTime={changeStartTime}
              changeEndTime={changeEndTime}
              resetToPreviousChanges={resetToPreviousChanges}
              removeCurrentItem={removeCurrentItem}
            />
          )}

          {showModal && selectedItem?.type === EItemType.OptoAcc && (
            <OptoAccusticModal
              selectedItem={selectedItem}
              closeModal={setCloseModal}
              changeStartTime={changeStartTime}
              changeEndTime={changeEndTime}
              resetToPreviousChanges={resetToPreviousChanges}
              removeCurrentItem={removeCurrentItem}
            />
          )}

          {newLightModal && selectedItem?.type === EItemType.Light && (
            <BrightModalNew
              selectedItem={selectedItem}
              closeModal={setCloseNewLightModal}
              changeStartTime={changeNewStartTime}
              changeEndTime={changeNewEndTime}
              changeBrightness={changeBrightnessNew}
              resetToPreviousChanges={resetToPreviousChangesNew}
              swapChangeable={swapChangeable}
              changeEndBrightness={changeEndBrightnessNew}
            />
          )}

          {newStepperModal && selectedItem?.type === EItemType.Stepper && (
            <StepperModalNew
              selectedItem={selectedItem}
              closeModal={setCloseNewStepperModal}
              changeStartTime={changeNewStartTime}
              changeVolume={changeNewVolume}
              resetToPreviousChanges={resetToPreviousChangesNew}
            />
          )}

          {newAirLiftModal && selectedItem?.type === EItemType.AirLift && (
            <AirLiftModalNew
              selectedItem={selectedItem}
              closeModal={setCloseNewAirLiftModal}
              changeStartTime={changeNewStartTime}
              changeEndTime={changeNewEndTime}
              resetToPreviousChanges={resetToPreviousChangesNew}
            />
          )}

          {newOptoAccusticModal && selectedItem?.type === EItemType.OptoAcc && (
            <OptoAccusticModalNew
              selectedItem={selectedItem}
              closeModal={setCloseNewOptoAccusticModal}
              changeStartTime={changeNewStartTime}
              changeEndTime={changeNewEndTime}
              resetToPreviousChanges={resetToPreviousChangesNew}
            />
          )}
        </section>
      </Grid>
    </ThemeProvider>
  );
}
