import React, {
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
  EItemType,
  Grid as GridType,
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
import { Button, Grid } from '@mui/material';
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
} from './sendMessage';

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
};

const ARROW_WIDTH = 6; // ширина стрелки, которая показывает положениее бегунка
const TIME_INTERVAL = 100;
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
}) => {
  const [gridWidth, setGridWidth] = useState(1200);
  const [translateX, setTranslateX] = useState(0);
  const [scale, setScale] = useState(1);
  const [scaleValue, setScaleValue] = useState(1);

  const allTime = useMemo(() => {
    return grid.reduce((acc, current) => {
      switch (current.type) {
        case EItemType.Stepper: {
          const max = Math.max(...current.changes.map((c) => c.endTime || 0));
          if (max > acc) {
            acc = max;
          }
          break;
        }
        case EItemType.Light: {
          const max = Math.max(...current.changes.map((c) => c.endTime || 0));
          if (max > acc) {
            acc = max;
          }
          break;
        }
        case EItemType.AirLift: {
          const max = Math.max(...current.changes.map((c) => c.endTime || 0));
          if (max > acc) {
            acc = max;
          }
          break;
        }
        case EItemType.OptoAcc: {
          const max = Math.max(...current.changes.map((c) => c.endTime || 0));
          if (max > acc) {
            acc = max;
          }
          break;
        }
      }
      return acc;
    }, 0);
  }, [grid]);

  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const intervalIdRef = useRef<number | NodeJS.Timer | null>(null);
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
      let commands = '';
      elementsRef.current.forEach((el, ind) => {
        if (el.type === EItemType.AirLift) {
          if (Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05) {
            console.log('START INIT', el);
            commands += startAirLiftCommand();
          }
        }

        if (el.type === EItemType.Light) {
          if (Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05) {
            console.log('START INIT', el);
            commands += startBrightCommand(el.brightness);

            if (
              el.isChangeable &&
              el.id !== currentChangeableBright.current?.id &&
              el.brightnessEnd
            ) {
              const brightnessDiff = Math.abs(el.brightnessEnd - el.brightness);
              console.log('brightnessDiff', brightnessDiff);
              const timeDiff = Math.abs(el.endTime - el.startTime);
              console.log('timeDiff', timeDiff);
              let timeStep = Math.floor((timeDiff / brightnessDiff) * 10) / 10;
              console.log('timeStep', timeStep);

              let brightStep =
                Math.floor((brightnessDiff / timeDiff) * 10) / 10;
              console.log('brightStep', brightStep);

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
            console.log('START INIT', el);
            commands += startValveCommand(el.line);
          }
        }
      });

      sendCommands(commands);
    }
  }, [start, gridWidth]);

  const started = useRef(false);

  useEffect(() => {
    if (start && timeArrowRef.current && !finish) {
      let secondsSpent = 0;
      if (!started.current) {
        started.current = true;
      }

      intervalIdRef.current && clearInterval(intervalIdRef.current);

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
                console.log('SKIP');
              } else if (
                Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                sendBright(el.brightness);

                if (
                  el.isChangeable &&
                  el.id !== currentChangeableBright.current?.id &&
                  el.brightnessEnd
                ) {
                  const brightnessDiff = el.brightnessEnd - el.brightness;
                  console.log('brightnessDiff', brightnessDiff);
                  const timeDiff = Math.abs(el.endTime - el.startTime);
                  console.log('timeDiff', timeDiff);
                  let timeStep =
                    Math.floor((timeDiff / brightnessDiff) * 10) / 10;
                  console.log('timeStep', timeStep);

                  let brightStep =
                    Math.floor((brightnessDiff / timeDiff) * 1000) / 1000;
                  console.log('brightStep', brightStep);

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
              } else if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                stopBright();
              }
            } else if (el.type === EItemType.Stepper) {
              if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05 &&
                elementsRef.current[ind + 1] &&
                el.endTime === elementsRef.current[ind + 1].startTime &&
                el.line === elementsRef.current[ind + 1].line
              ) {
                console.log('SKIP');
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
                console.log('SKIP');
              } else if (
                Math.abs(el.startTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                startAirLift();
              } else if (
                Math.abs(el.endTime - timerIntervalRef.current / 1000) < 0.05
              ) {
                stopAirLift();
              }
            }
          });

          if (
            currentChangeableBright.current &&
            currentChangeableBright.current.startTime <
              timerIntervalRef.current / 1000 &&
            currentChangeableBright.current.endTime >=
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

              console.log('nextBrightness', nextBrightness);
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
          setFinish(true);
          intervalIdRef.current && clearInterval(intervalIdRef.current);
        }
      }, TIME_INTERVAL);
    }
  }, [start, gridWidth, finish]);

  useEffect(() => {
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
      const distance = 16 * gridWidth - ARROW_WIDTH;
      timeArrowRef5.current.style.left = `${distance}px`;
    }

    if (start && timeArrowRef6.current) {
      const distance = 32 * gridWidth - ARROW_WIDTH;
      timeArrowRef6.current.style.left = `${distance}px`;
    }

    if (start && timeArrowRef7.current) {
      const distance = 64 * gridWidth - ARROW_WIDTH;
      timeArrowRef7.current.style.left = `${distance}px`;
    }

    started.current = true;
  }, [start, gridWidth]);

  useEffect(() => {
    if (!start && started.current) {
      seconds = 0;
      started.current = false;
      intervalIdRef.current && clearInterval(intervalIdRef.current);
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
    }
  }, [start, gridWidth]);

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
    if (scale < 20 /*Math.pow(2, scalesCount)*/ && sectionRef.current) {
      const sectionWidth = sectionRef.current.getBoundingClientRect().width;
      const translate = sectionWidth / 2 - sectionWidth / 2 / (scale * 2);

      const currentScale = scaleValue + 1; // * scaleFactor;
      setScaleValue(currentScale);
      setScale(scaleMapper[currentScale]);
      setTranslateX(translate);

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
      // const currentScale = scale / scaleFactor;
      const currentScale = scaleValue - 1; // * scaleFactor;
      const sectionWidth = sectionRef.current.getBoundingClientRect().width;
      const translate = sectionWidth / 2 - sectionWidth / 2 / (scale / 2);

      setScaleValue(currentScale);
      setScale(scaleMapper[currentScale]);
      setTranslateX(translate);

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
    } else if (translateX !== 0) {
      setTranslateX(0);
    }
  };

  useEffect(() => {
    return () => {
      document.body.removeEventListener('wheel', cancelWheel);
    };
  }, []);

  const changScale = (e: React.WheelEvent) => {
    if (sectionRef.current) {
      if (e.deltaY < 0) {
        increaseScale();
      } else {
        decreaseScale();
      }
    }
  };

  return (
    <>
      <span>Масштаб: {scale}</span>
      <Timer start={start} finish={finish} />
      <Grid ref={gridContainerRef} container>
        <Grid xs={12}>
          <div style={{ display: 'flex' }}>
            <div className={styles.gridContainer}>
              <div className={styles.descriptionContainer}>
                {grid.map((element) => (
                  <div className={styles.description}>{element.name}</div>
                ))}
              </div>
              <div className={styles.gridContent}>
                <section ref={gridRef} className={styles.container}>
                  <section
                    className={styles.linesKeeper}
                    ref={sectionRef}
                    id={'linesKeeper'}
                    onWheel={changScale}
                    onMouseEnter={() => {
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
                      style={
                        {
                          // transform: `scaleX(${scale}) translateX(${translateX}px)`,
                          // transform: `scaleX(${scale})`,
                        }
                      }
                    >
                      {grid.map((element, ind) => {
                        return (
                          <GridRow
                            key={element.id}
                            allTime={allTime}
                            element={element}
                            selectItem={selectItem}
                            gridWidth={gridWidth}
                            scale={scale}
                          />
                        );
                      })}
                      <TimeLine
                        scale={scale}
                        width={gridWidth}
                        allTime={allTime}
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
                      visible={scale === 16}
                      elementRef={timeArrowRef5}
                    />
                    <TimeArrow
                      id={'timeArrow6'}
                      visible={scale === 32}
                      elementRef={timeArrowRef6}
                    />
                    <TimeArrow
                      id={'timeArrow7'}
                      visible={scale === 64}
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

        <Grid marginTop="1.5rem" xs={12}>
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
        </Grid>
      </Grid>
    </>
  );
};

export const GridElement = React.memo(_GridElement);
