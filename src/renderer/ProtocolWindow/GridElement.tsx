import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GridRow } from './RowElement/RowElement';
import {
  AirLifItem,
  CalibrationTypeRecord,
  Days,
  EChannels,
  EItemType,
  Grid as GridType,
  GridDays,
  LightItem,
  LineTypeAirLift,
  LineTypeLight,
  LineTypeOptoAccustic,
  LineTypeStepper,
  OptoAccusticItem,
  StepperItem,
} from '../../Types/Types';
import styles from './grid.module.css';
import { TimeArrow } from './TimeArrow/TimeArrow';
import { Button, Grid, Typography } from '@mui/material';
import { Timer } from './Timer/Timer';
import { ValveTimeComponentAdder } from './ValveTimeComponentAdder/ValveTimeComponentAdder';
import { TimeLine } from './TimeLine/TimeLine';
import {
  sendBright,
  sendCommands,
  startAirLift,
  startAirLiftCommand,
  startBrightCommand,
  startValve,
  startValveCommand,
  stopAirLift,
  stopAll,
  stopBright,
  stopValve,
  startOptic,
  stopOptic,
  startOpticCommand,
} from './sendMessage';
import {
  getHoursAndMinutes,
  Seconds_In_Minute,
  Seconds_In_Hour,
} from '../helpers/getHoursAndMinutes';
import { emptyGrid, testGrid } from '../InitialGrid';

type GridProps = {
  grid: GridType;
  selectItem: (
    selectedItem: StepperItem | LightItem | AirLifItem | OptoAccusticItem
  ) => void;
  selectNewLightItem: (selectedLine: LineTypeLight) => void;
  selectNewStepperItem: (selectedLine: LineTypeStepper) => void;
  selectNewAirLiftItem: (selectedLine: LineTypeAirLift) => void;
  selectNewOptoAccustic: (selectedLine: LineTypeOptoAccustic) => void;
  calibrationValuesTime: CalibrationTypeRecord;
  start: boolean;
  setStart: (value: boolean) => void;
  finish: boolean;
  setFinish: (value: boolean) => void;
  currentDay: number;
  setCurrentDay: (value: number) => void;
  days: Days;
  setDays: (days: Days) => void;
  mainGridArray: GridDays;
  setMainGridArray: (grid: GridDays) => void;
};

const scalesCount = 6;
const scaleFactor = 2;

const scaleMapper = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 12,
  // 6: 15,
  6: 24,
  7: 120,
};

const ARROW_WIDTH = 6; // ширина стрелки, которая показывает положениее бегунка
const TIME_INTERVAL = 100;
const TIME_INTERVAL_CO2 = 3000;
let seconds = 0;

const cancelWheel = (event: React.WheelEvent) => event.preventDefault();

const _GridElement: React.FC<GridProps> = ({
  grid,
  selectItem,
  calibrationValuesTime,
  selectNewLightItem,
  selectNewStepperItem,
  selectNewAirLiftItem,
  selectNewOptoAccustic,
  start,
  setStart,
  finish,
  setFinish,
  currentDay,
  setCurrentDay,
  days,
  setDays,
  mainGridArray,
  setMainGridArray,
}) => {
  const [gridWidth, setGridWidth] = useState(1200);
  const [scale, setScale] = useState(1);
  const [scaleValue, setScaleValue] = useState(1);

  const currentDayRef = useRef(currentDay);
  const copyGridRef = useRef<GridType | null>(null);

  useEffect(() => {
    currentDayRef.current = currentDay;
  }, [currentDay]);

  const allTime = useMemo(() => {
    // const timeSeconds = grid.reduce((acc, current) => {
    //   switch (current.type) {
    //     case EItemType.Stepper: {
    //       const max = Math.max(...current.changes.map((c) => c.endTime || 0));
    //       if (max > acc) {
    //         acc = max;
    //       }
    //       break;
    //     }
    //     case EItemType.Light: {
    //       const max = Math.max(...current.changes.map((c) => c.endTime || 0));
    //       if (max > acc) {
    //         acc = max;
    //       }
    //       break;
    //     }
    //     case EItemType.AirLift: {
    //       const max = Math.max(...current.changes.map((c) => c.endTime || 0));
    //       if (max > acc) {
    //         acc = max;
    //       }
    //       break;
    //     }
    //     case EItemType.OptoAcc: {
    //       const max = Math.max(...current.changes.map((c) => c.endTime || 0));
    //       if (max > acc) {
    //         acc = max;
    //       }
    //       break;
    //     }
    //   }
    //   return acc;
    // }, 0);

    // return timeSeconds;
    // const { days } = getHoursAndMinutes(timeSeconds);
    // return days * 24 * Seconds_In_Hour;
    return 86400
    //return 10;
    // if (process.env.NODE_ENV === 'development') {
    //   return days * 24 * Seconds_In_Hour;
    // }

    // return 1 * Seconds_In_Hour;
  }, [grid]);

  const intervalIdRef = useRef<number | NodeJS.Timer | null>(null);
  const intervalIdCO2Ref = useRef<number | NodeJS.Timer | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const timeArrowRef = useRef<HTMLDivElement | null>(null);
  const timeArrowRef2 = useRef<HTMLDivElement | null>(null);
  const timeArrowRef3 = useRef<HTMLDivElement | null>(null);
  const timeArrowRef4 = useRef<HTMLDivElement | null>(null);
  const timeArrowRef5 = useRef<HTMLDivElement | null>(null);
  const timeArrowRef6 = useRef<HTMLDivElement | null>(null);
  const timeArrowRef7 = useRef<HTMLDivElement | null>(null);

  const elementsRef = useRef<
    (StepperItem | LightItem | AirLifItem | OptoAccusticItem)[]
  >([]);

  elementsRef.current = grid.flatMap<
    StepperItem | LightItem | AirLifItem | OptoAccusticItem
  >((elements) => elements.changes.flatMap((c) => c));

  const timerIntervalRef = useRef(0);

  const currentChangeableBright = useRef<
    | (LightItem & {
        brightStep: number;
        timeStep: number;
        currentBrightness: number;
      })
    | null
  >(null);

  useEffect(() => {
    if (start && timeArrowRef.current) {
      setStartCondition();
    }
  }, [start]);

  const started = useRef(false);

  useEffect(() => {
    // console.log('days', days);
    // console.log('currentDay', currentDay);
    if (start && timeArrowRef.current && !finish) {
      let secondsSpent = 0;
      if (!started.current) {
        started.current = true;
      }

      intervalIdRef.current && clearInterval(intervalIdRef.current);
      intervalIdCO2Ref.current && clearInterval(intervalIdCO2Ref.current);

      intervalIdRef.current = setInterval(() => {
        timerIntervalRef.current += TIME_INTERVAL;

        if (Math.floor(timerIntervalRef.current / 1000) >= seconds) {
          seconds += 1;
        }

        if (timeArrowRef.current && timeArrowRef.current.style) {
          elementsRef.current.forEach((el, ind) => {
            if (el.type === EItemType.Light) {
              if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05 &&
                elementsRef.current[ind + 1] &&
                el.endTime === elementsRef.current[ind + 1].startTime &&
                el.line === elementsRef.current[ind + 1].line
              ) {
                console.log('SKIP LIGHT');
              } else if (
                Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                console.log('PPPPPPP');
                sendBright(el.brightness);

                if (
                  el.isChangeable &&
                  el.id !== currentChangeableBright.current?.id &&
                  el.brightnessEnd
                ) {
                  const brightnessDiff = el.brightnessEnd - el.brightness;
                  const timeDiff = Math.abs(el.endTime - el.startTime);
                  let timeStep =
                    Math.floor((timeDiff / brightnessDiff) * 10) / 10;

                  let brightStep =
                    Math.floor((brightnessDiff / timeDiff) * 1000) / 1000;

                  if (timeStep < 1) {
                    timeStep = 1;
                  }

                  currentChangeableBright.current = {
                    ...el,
                    brightStep,
                    timeStep,
                    currentBrightness: el.brightness,
                  };
                }
              } else if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                console.log('STOP?', el);
                stopBright();
              }
            } else if (el.type === EItemType.Stepper) {
              if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05 &&
                elementsRef.current[ind + 1] &&
                el.endTime === elementsRef.current[ind + 1].startTime &&
                el.line === elementsRef.current[ind + 1].line
              ) {
                console.log('SKIP STEPPER');
              } else if (
                Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                startValve(el.line);
              } else if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                stopValve(el.line);
              }
            } else if (el.type === EItemType.AirLift) {
              if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05 &&
                elementsRef.current[ind + 1] &&
                el.endTime === elementsRef.current[ind + 1].startTime &&
                el.line === elementsRef.current[ind + 1].line
              ) {
                console.log('SKIP AIR');
              } else if (
                Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                console.log('AIR LIFT START')
                startAirLift();
              } else if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                stopAirLift();
              }
            } else if (el.type === EItemType.OptoAcc) {
              if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05 &&
                elementsRef.current[ind + 1] &&
                el.endTime === elementsRef.current[ind + 1].startTime &&
                el.line === elementsRef.current[ind + 1].line
              ) {
                console.log('SKIP OPTO');
              } else if (
                Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                startOptic();
              } else if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                stopOptic();
              }
            }
          });

          if (
            currentChangeableBright.current &&
            currentChangeableBright.current.startTime <
              timerIntervalRef.current / 1000 &&
            currentChangeableBright.current.endTime >
              timerIntervalRef.current / 1000 &&
            currentChangeableBright.current?.brightnessEnd
          ) {
            if (secondsSpent < seconds) {
              secondsSpent = seconds;
              const nextBrightness = Number(
                (
                  currentChangeableBright.current.currentBrightness +
                  currentChangeableBright.current.brightStep
                ).toFixed(4)
              );

              if (
                Math.abs(
                  nextBrightness -
                    currentChangeableBright.current.currentBrightness
                ) > 0.1
              ) {
                sendBright(nextBrightness);
              }
              currentChangeableBright.current.currentBrightness =
                nextBrightness;
            }
          }
        }

        if (timerIntervalRef.current / 1000 >= allTime) {
          if (days.length > currentDayRef.current + 1) {
            console.log('QQQQQ');
            setCurrentDay((prev) => prev + 1);
            timerIntervalRef.current = 0;
            moveTimeArrowsToStart();
            setTimeout(() => {
              setArrowsDistance();
              setStartCondition();
            }, 0);
            secondsSpent = 0;
          } else {
            console.log('FFFFFF');
            setFinish(true);
            intervalIdRef.current && clearInterval(intervalIdRef.current);
            intervalIdCO2Ref.current && clearInterval(intervalIdCO2Ref.current);
          }
        }
      }, TIME_INTERVAL);

      intervalIdCO2Ref.current = setInterval(() => {
        window.electron.serialPort.sendMessage('serial-channel', [
          'serialCo2:transfer',
          '@RRDT',
        ]);
      }, TIME_INTERVAL_CO2);
    }
  }, [start, finish]);

  useEffect(() => {
    setArrowsDistance();

    started.current = true;
  }, [start]);

  useEffect(() => {
    if (!start && started.current) {
      started.current = false;
      intervalIdRef.current && clearInterval(intervalIdRef.current);
      intervalIdCO2Ref.current && clearInterval(intervalIdCO2Ref.current);
      moveTimeArrowsToStart();
    }
  }, [start, gridWidth]);

  const moveTimeArrowsToStart = () => {
    seconds = 0;

    if (timeArrowRef.current) {
      timerIntervalRef.current = 0;
      timeArrowRef.current.style.transition = 'none';
      timeArrowRef.current.style.left = `-${ARROW_WIDTH}px`;
      setTimeout(() => {
        if (timeArrowRef.current) {
          timeArrowRef.current.style.transition = `left ${TIME_INTERVAL}ms linear`;
          timeArrowRef.current.style.transition = `left ${allTime}s linear`;
        }
      }, 0);
    }

    if (timeArrowRef2.current) {
      timeArrowRef2.current.style.transition = 'none';
      timeArrowRef2.current.style.left = `${-ARROW_WIDTH}px`;
      setTimeout(() => {
        if (timeArrowRef2.current) {
          timeArrowRef2.current.style.transition = `left ${TIME_INTERVAL}ms linear`;
          timeArrowRef2.current.style.transition = `left ${allTime}s linear`;
        }
      }, 0);
    }

    if (timeArrowRef3.current) {
      timeArrowRef3.current.style.transition = 'none';
      timeArrowRef3.current.style.left = `${-ARROW_WIDTH}px`;
      setTimeout(() => {
        if (timeArrowRef3.current) {
          timeArrowRef3.current.style.transition = `left ${TIME_INTERVAL}ms linear`;
          timeArrowRef3.current.style.transition = `left ${allTime}s linear`;
        }
      }, 0);
    }

    if (timeArrowRef4.current) {
      timeArrowRef4.current.style.transition = 'none';
      timeArrowRef4.current.style.left = `${-ARROW_WIDTH}px`;
      setTimeout(() => {
        if (timeArrowRef4.current) {
          timeArrowRef4.current.style.transition = `left ${TIME_INTERVAL}ms linear`;
          timeArrowRef4.current.style.transition = `left ${allTime}s linear`;
        }
      }, 0);
    }

    if (timeArrowRef5.current) {
      timeArrowRef5.current.style.transition = 'none';
      timeArrowRef5.current.style.left = `${-ARROW_WIDTH}px`;
      setTimeout(() => {
        if (timeArrowRef5.current) {
          timeArrowRef5.current.style.transition = `left ${TIME_INTERVAL}ms linear`;
          timeArrowRef5.current.style.transition = `left ${allTime}s linear`;
        }
      }, 0);
    }

    if (timeArrowRef6.current) {
      timeArrowRef6.current.style.transition = 'none';
      timeArrowRef6.current.style.left = `${-ARROW_WIDTH}px`;
      setTimeout(() => {
        if (timeArrowRef6.current) {
          timeArrowRef6.current.style.transition = `left ${TIME_INTERVAL}ms linear`;
          timeArrowRef6.current.style.transition = `left ${allTime}s linear`;
        }
      }, 0);
    }

    if (timeArrowRef7.current) {
      timeArrowRef7.current.style.transition = 'none';
      timeArrowRef7.current.style.left = `${-ARROW_WIDTH}px`;
      setTimeout(() => {
        if (timeArrowRef7.current) {
          timeArrowRef7.current.style.transition = `left ${TIME_INTERVAL}ms linear`;
          timeArrowRef7.current.style.transition = `left ${allTime}s linear`;
        }
      }, 0);
    }
  };

  const setArrowsDistance = () => {
    if (start && timeArrowRef.current) {
      timeArrowRef.current.style.left = `${gridWidth - ARROW_WIDTH}px`;
    }

    if (start && timeArrowRef2.current) {
      const distance = 2 * gridWidth - ARROW_WIDTH;
      timeArrowRef2.current.style.left = `${distance}px`;
    }

    if (start && timeArrowRef3.current) {
      const distance = 4 * gridWidth - ARROW_WIDTH;
      timeArrowRef3.current.style.left = `${distance}px`;
    }

    if (start && timeArrowRef4.current) {
      const distance = 8 * gridWidth - ARROW_WIDTH;
      timeArrowRef4.current.style.left = `${distance}px`;
    }

    if (start && timeArrowRef5.current) {
      const distance = 12 * gridWidth - ARROW_WIDTH;
      timeArrowRef5.current.style.left = `${distance}px`;
    }

    if (start && timeArrowRef6.current) {
      const distance = 24 * gridWidth - ARROW_WIDTH;
      timeArrowRef6.current.style.left = `${distance}px`;
    }

    if (start && timeArrowRef7.current) {
      const distance = 120 * gridWidth - ARROW_WIDTH;
      timeArrowRef7.current.style.left = `${distance}px`;
    }
  };

  const setStartCondition = () => {
    let commands = '';
    elementsRef.current.forEach((el, ind) => {
      if (el.type === EItemType.AirLift) {
        if (Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05) {
          // console.log('START INIT', el);
          commands += startAirLiftCommand();
        }
      }

      if (el.type === EItemType.Light) {
        if (Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05) {
          // console.log('START INIT', el);
          commands += startBrightCommand(el.brightness);

          if (
            el.isChangeable &&
            el.id !== currentChangeableBright.current?.id &&
            el.brightnessEnd
          ) {
            const brightnessDiff = Math.abs(el.brightnessEnd - el.brightness);
            // console.log('brightnessDiff', brightnessDiff);
            const timeDiff = Math.abs(el.endTime - el.startTime);
            // console.log('timeDiff', timeDiff);
            let timeStep = Math.floor((timeDiff / brightnessDiff) * 10) / 10;
            // console.log('timeStep', timeStep);

            let brightStep = Math.floor((brightnessDiff / timeDiff) * 10) / 10;
            // console.log('brightStep', brightStep);

            if (timeStep < 1) {
              timeStep = 1;
            }

            currentChangeableBright.current = {
              ...el,
              brightStep,
              timeStep,
              currentBrightness: el.brightness,
            };

            console.log(
              'currentChangeableBright.current',
              currentChangeableBright.current
            );
          }
        }
      }

      if (el.type === EItemType.Stepper) {
        if (Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05) {
          // console.log('START INIT', el);
          commands += startValveCommand(el.line);
        }
      } else if (el.type === EItemType.OptoAcc) {
        if (Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05) {
        // console.log('START INIT', el);
          commands += startOpticCommand();
        }
      }
    });

    sendCommands(commands);
  };

  // useEffect(() => {
  //   if (sectionRef.current && !started.current) {
  //     started.current = true;
  //     const width = sectionRef.current.getBoundingClientRect().width;
  //     // setGridWidth(width);
  //   }
  // }, []);

  useLayoutEffect(() => {
    if (timeArrowRef.current) {
      timeArrowRef.current.style.transition = `left ${allTime}s linear`;
      timeArrowRef.current.style.left = `${-ARROW_WIDTH}px`;
    }

    if (timeArrowRef2.current) {
      timeArrowRef2.current.style.transition = `left ${allTime}s linear`;
      timeArrowRef2.current.style.left = `${-ARROW_WIDTH}px`;
    }

    if (timeArrowRef3.current) {
      timeArrowRef3.current.style.transition = `left ${allTime}s linear`;
      timeArrowRef3.current.style.left = `${-ARROW_WIDTH}px`;
    }

    if (timeArrowRef4.current) {
      timeArrowRef4.current.style.transition = `left ${allTime}s linear`;
      timeArrowRef4.current.style.left = `${-ARROW_WIDTH}px`;
    }

    if (timeArrowRef5.current) {
      timeArrowRef5.current.style.transition = `left ${allTime}s linear`;
      timeArrowRef5.current.style.left = `${-ARROW_WIDTH}px`;
    }

    if (timeArrowRef6.current) {
      timeArrowRef6.current.style.transition = `left ${allTime}s linear`;
      timeArrowRef6.current.style.left = `${-ARROW_WIDTH}px`;
    }

    if (timeArrowRef7.current) {
      timeArrowRef7.current.style.transition = `left ${allTime}s linear`;
      timeArrowRef7.current.style.left = `${-ARROW_WIDTH}px`;
    }
  }, []);

  const increaseScale = () => {
    if (scale < 120 /*Math.pow(2, scalesCount)*/ && sectionRef.current) {
      const sectionWidth = sectionRef.current.getBoundingClientRect().width;
      const translate = sectionWidth / 2 - sectionWidth / 2 / (scale * 2);

      const currentScale = scaleValue + 1; // * scaleFactor;
      setScaleValue(currentScale);
      setScale(scaleMapper[currentScale]);

      if (!finish) {
        if (timeArrowRef.current) {
          setTimeout(() => {
            timeArrowRef.current?.focus();
          }, 10);
        }

        if (timeArrowRef2.current) {
          setTimeout(() => {
            timeArrowRef2.current?.focus();
          }, 10);
        }

        if (timeArrowRef3.current) {
          setTimeout(() => {
            timeArrowRef3.current?.focus();
          }, 10);
        }

        if (timeArrowRef4.current) {
          setTimeout(() => {
            timeArrowRef4.current?.focus();
          }, 10);
        }

        if (timeArrowRef5.current) {
          setTimeout(() => {
            timeArrowRef5.current?.focus();
          }, 10);
        }

        if (timeArrowRef6.current) {
          setTimeout(() => {
            timeArrowRef6.current?.focus();
          }, 10);
        }

        if (timeArrowRef7.current) {
          setTimeout(() => {
            timeArrowRef7.current?.focus();
          }, 10);
        }
      }
    }
  };

  const decreaseScale = () => {
    if (scale > 1 && sectionRef.current) {
      const currentScale = scaleValue - 1; // * scaleFactor;
      const sectionWidth = sectionRef.current.getBoundingClientRect().width;
      const translate = sectionWidth / 2 - sectionWidth / 2 / (scale / 2);

      setScaleValue(currentScale);
      setScale(scaleMapper[currentScale]);

      if (!finish) {
        if (timeArrowRef.current) {
          setTimeout(() => {
            timeArrowRef.current?.focus();
          }, 10);
        }

        if (timeArrowRef2.current) {
          setTimeout(() => {
            timeArrowRef2.current?.focus();
          }, 10);
        }

        if (timeArrowRef3.current) {
          setTimeout(() => {
            timeArrowRef3.current?.focus();
          }, 10);
        }

        if (timeArrowRef4.current) {
          setTimeout(() => {
            timeArrowRef4.current?.focus();
          }, 10);
        }

        if (timeArrowRef5.current) {
          setTimeout(() => {
            timeArrowRef5.current?.focus();
          }, 10);
        }

        if (timeArrowRef6.current) {
          setTimeout(() => {
            timeArrowRef6.current?.focus();
          }, 10);
        }

        if (timeArrowRef7.current) {
          setTimeout(() => {
            timeArrowRef7.current?.focus();
          }, 10);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      document.body.removeEventListener('wheel', cancelWheel);
    };
  }, []);

  const [currentPos, setCurrentPos] = useState(0);

  const changScale = (e: React.WheelEvent) => {
    if (sectionRef.current) {
      const diffx = e.clientX - e.currentTarget.getBoundingClientRect().x;
      if (e.deltaY < 0) {
        increaseScale();
        // setTimeout(() => {
        //   const currentScale = scaleValue + 1; // * scaleFactor;
        //   const resultScaleFactor = scaleMapper[currentScale];
        //   if (resultScaleFactor) {
        //     const positionSet = (resultScaleFactor - 1) * diffx;
        //     sectionRef.current?.scrollTo({ left: positionSet });
        //   }
        // }, 10);
      } else {
        decreaseScale();
      }
    }
  };

  const scrollTo = () => {
    if (sectionRef.current) {
      sectionRef.current.scrollTo({ left: currentPos });
    }
  };

  const _increaseCurrentDay = useCallback(() => {
    if (days.length > currentDay + 1) {
      setCurrentDay(currentDay + 1);
    }
  }, [currentDay, days]);

  const _decreaseCurrentDay = useCallback(() => {
    if (currentDay > 0) {
      setCurrentDay(currentDay - 1);
    }
  }, [currentDay]);

  const _addDay = useCallback(() => {
    const lastElement = days.length - 1;
    const gridElement = mainGridArray[lastElement];

    if (gridElement) {
      const totalChanges = gridElement.reduce(
        (acc, curr) => acc + curr.changes.length,
        0
      );

      if (totalChanges !== 0) {
        const day = days[lastElement];

        setDays([...days, day + 1]);

        setMainGridArray([
          ...mainGridArray,
          emptyGrid,
        ]);
      }
    }
  }, [days, mainGridArray]);

  const _remove = useCallback(() => {
    if (days.length > 1) {
      setDays([...days.slice(0, days.length - 1)]);
      setMainGridArray(
        mainGridArray.filter((g, index) => index !== currentDay)
      );

      if (currentDay === days.length - 1 && currentDay > 0) {
        setCurrentDay(currentDay - 1);
      }
    }
  }, [days, currentDay, mainGridArray]);

  const _copy = () => {
    copyGridRef.current = grid;
  };

  const _paste = () => {
    if (copyGridRef.current) {
      const newMainGridArray = [...mainGridArray];

      newMainGridArray[currentDay] = copyGridRef.current;

      setMainGridArray([...newMainGridArray]);
    }
  };

  return (
    <>
      <Typography>Масштаб: {scale}</Typography>
      <Timer start={start} finish={finish} />
      {/*<Button onClick={scrollTo}>Scroll</Button>*/}
      {/*<input*/}
      {/*  value={currentPos}*/}
      {/*  onChange={(e) => {*/}
      {/*    setCurrentPos(+e.target.value);*/}
      {/*  }}*/}
      {/*/>*/}
      {/*<span>currentPos: {currentPos}</span>*/}
      <Grid container>
        <Grid xs={12}>
          <div style={{ display: 'flex' }}>
            <div className={styles.gridContainer}>
              <div className={styles.descriptionContainer}>
                {grid.map((element) => (
                  <Typography key={element.id} className={styles.description}>{element.name}</Typography>
                ))}
              </div>
              <div className={styles.gridContent}>
                <section className={styles.container}>
                  <section
                    className={styles.linesKeeper}
                    ref={sectionRef}
                    id={'linesKeeper'}
                    onWheel={changScale}
                    onMouseEnter={(event) => {
                      document.body.addEventListener('wheel', cancelWheel, {
                        passive: false,
                      });
                    }}
                    onMouseLeave={() => {
                      document.body.removeEventListener('wheel', cancelWheel);
                    }}
                  >
                    <div
                      id={'linesKeeperContainer'}
                      className={styles.linesKeeperContainer}
                    >
                      {grid.map((element, ind) => {
                        return (
                          <GridRow
                            key={element.id}
                            // allTime={allTime}
                            // allTime={86400}
                            allTime={allTime}
                            element={element}
                            selectItem={selectItem}
                            gridWidth={gridWidth}
                            scale={scale}
                          />
                        );
                      })}
                      {/*{Object.values(scaleMapper).map((v) => (*/}
                      {/*  <TimeLine*/}
                      {/*    scale={v}*/}
                      {/*    width={gridWidth}*/}
                      {/*    allTime={allTime}*/}
                      {/*    visible={scale === v}*/}
                      {/*  />*/}
                      {/*))}*/}
                      <TimeLine
                        scale={scale}
                        width={gridWidth}
                        allTime={allTime}
                        visible
                      />
                    </div>
                    <TimeArrow
                      id={'timeArrow1'}
                      visible={scale === 1}
                      elementRef={timeArrowRef}
                    />
                    <TimeArrow
                      id={'timeArrow2'}
                      visible={scale === 2}
                      elementRef={timeArrowRef2}
                    />
                    <TimeArrow
                      id={'timeArrow3'}
                      visible={scale === 4}
                      elementRef={timeArrowRef3}
                    />
                    <TimeArrow
                      id={'timeArrow4'}
                      visible={scale === 8}
                      elementRef={timeArrowRef4}
                    />
                    <TimeArrow
                      id={'timeArrow5'}
                      visible={scale === 12}
                      elementRef={timeArrowRef5}
                    />
                    <TimeArrow
                      id={'timeArrow6'}
                      visible={scale === 24}
                      elementRef={timeArrowRef6}
                    />
                    <TimeArrow
                      id={'timeArrow7'}
                      visible={scale === 120}
                      elementRef={timeArrowRef7}
                    />
                  </section>
                </section>
              </div>
            </div>

            <div className={styles.valveTimeComponentAdderContainer}>
              <ValveTimeComponentAdder
                lines={grid.map((element) => element)}
                selectNewLightItem={selectNewLightItem}
                selectNewStepperItem={selectNewStepperItem}
                selectNewAirLiftItem={selectNewAirLiftItem}
                selectNewOptoAccustic={selectNewOptoAccustic}
              />
            </div>
          </div>
        </Grid>

        <Grid
          marginTop="1.5rem"
          xs={12}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <div>
            <Button
              disabled={start}
              onClick={() => {
                setStart(true);
                setFinish(false);
              }}
              variant="contained"
            >
              Старт
            </Button>
            <Button
              onClick={() => {
                setStart(false);
                setFinish(true);
                stopAll();
                currentChangeableBright.current = null;
              }}
              variant="contained"
            >
              Стоп
            </Button>
            <Button
              onClick={() => {
                window.electron.ipcRenderer.sendMessage(
                  EChannels.saveProtocol,
                  mainGridArray
                );
              }}
              variant="contained"
            >
              Сохранить
            </Button>
            <Button
              onClick={() => {
                window.electron.ipcRenderer.sendMessage(EChannels.loadProtocol);
              }}
              variant="contained"
            >
              Загрузить протокол
            </Button>
            {/* <Button
            onClick={() => {
              startValve('x')
              startValve('y')
              startValve('z')
              startValve('e')
            }}
            variant="contained"
          >
            пуск
          </Button>
          <Button
            onClick={() => {
              stopValve('x')
              stopValve('y')
              stopValve('z')
              stopValve('e')
            }}
            variant="contained"
          >
            не пуск
          </Button> */}
          </div>
          <div>
            <Typography variant="body1" component="span">Выбранный день {currentDay + 1}</Typography>
            <Button disabled={start} onClick={_decreaseCurrentDay}>Назад</Button>
            <Button disabled={start} onClick={_increaseCurrentDay}>Вперед</Button>
            <Button disabled={start} onClick={_addDay}>Добавить</Button>
            <Button disabled={start} onClick={_remove}>Удалить</Button>
            <Button disabled={start} onClick={_copy}>Скопировать</Button>
            <Button disabled={start} onClick={_paste}>Вставить</Button>
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export const GridElement = React.memo(_GridElement);
