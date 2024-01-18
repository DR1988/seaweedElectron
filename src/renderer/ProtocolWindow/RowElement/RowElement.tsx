import React from 'react';

import styles from './Row.module.css';
import {
  StepperItem,
  LightItem,
  LineTypeStepper,
  LineTypeLight,
  LineTypeAirLift,
  LineTypeOptoAccustic,
  AirLifItem,
  OptoAccusticItem,
} from '../../../Types/Types';
import { BrightItemElement } from '../ItemElement/BrightItemElement';
import { StepperItemElement } from '../ItemElement/StepperItemElement';
import { AirLiftElement } from '../ItemElement/AirLiftElement';
import { OptoAccusticElement } from '../ItemElement/OptoAccusticElement';

type GridRowProps = {
  element:
    | LineTypeStepper
    | LineTypeLight
    | LineTypeAirLift
    | LineTypeOptoAccustic;
  allTime: number;
  selectItem: (
    selectedItem: StepperItem | LightItem | AirLifItem | OptoAccusticItem
  ) => void;
  gridWidth: number;
  scale: number;
};

export const GridRow: React.FC<GridRowProps> = ({
  element,
  allTime,
  selectItem,
  gridWidth,
  scale,
}) => {
  return (
    <div
      style={
        {
          // width: `${scale * 1200 + 20}px`,
        }
      }
      className={styles.row}
    >
      {/*<div style={{ position: 'absolute', left: -50 }}>{element.name}</div>*/}
      {element.changes.map((change) => {
        switch (change.type) {
          case 'light':
            return (
              <BrightItemElement
                key={change.id}
                item={change}
                allTime={allTime}
                selectItem={selectItem}
                gridWidth={gridWidth}
                scale={scale}
              />
            );

          case 'stepper':
            return (
              <StepperItemElement
                selectItem={selectItem}
                key={change.id}
                item={change}
                allTime={allTime}
                gridWidth={gridWidth}
                scale={scale}
              />
            );

          case 'air_lift':
            return (
              <AirLiftElement
                key={change.id}
                item={change}
                allTime={allTime}
                selectItem={selectItem}
                gridWidth={gridWidth}
                scale={scale}
              />
            );

          case 'opto_accustic':
            return (
              <OptoAccusticElement
                key={change.id}
                item={change}
                allTime={allTime}
                selectItem={selectItem}
                gridWidth={gridWidth}
                scale={scale}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
