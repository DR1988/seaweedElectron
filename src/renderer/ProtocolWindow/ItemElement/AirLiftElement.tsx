import React from 'react';
import styles from './Item.module.css';
import {
  AirLifItem,
  LightItem,
  OptoAccusticItem,
  StepperItem,
} from '../../../Types/Types';

type ItemProps = {
  item: AirLifItem;
  allTime: number;
  selectItem: (
    selectedItem: StepperItem | LightItem | AirLifItem | OptoAccusticItem
  ) => void;
  gridWidth: number;
  scale: number;
};

export const AirLiftElement: React.FC<ItemProps> = ({
  item,
  allTime,
  selectItem,
  gridWidth,
  scale,
}) => {
  const { startTime, endTime } = item;

  const width = endTime - startTime;

  const _selectItem = React.useCallback(() => {
    selectItem(item);
  }, [selectItem, item]);

  const { crosses } = item;
  return (
    <>
      <div
        onClick={_selectItem}
        className={styles.item}
        style={{
          left: `${(gridWidth * startTime * scale) / allTime}px`,
          width: `${(gridWidth * width * scale) / allTime}px`,
        }}
      >
        <span
        // style={{ transform: `scaleX(${1 / scale})` }}
        >
          {width}
        </span>
      </div>
      {crosses?.map((cross) => (
        <div
          className={styles.errorItem}
          style={{
            zIndex: 2,
            left: `${(gridWidth * cross.crossingValueStart) / allTime}px`,
            width: `${
              (gridWidth *
                Math.abs(cross.crossingValueEnd - cross.crossingValueStart)) /
              allTime
            }px`,
            background: `repeating-linear-gradient(
            45deg, rgba(230, 100, 101, 0.7),
            rgba(230, 100, 101, 0.7) 20px,
            rgba(145, 152, 229, 0.7) 20px,
            rgba(145, 152, 229, 0.7) 35px)
            `,
          }}
        />
      ))}
    </>
  );
};
