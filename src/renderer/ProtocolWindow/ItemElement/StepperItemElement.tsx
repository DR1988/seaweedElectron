import React from 'react';

import styles from './Item.module.css';
import { LightItem, StepperItem } from '../../../Types/Types';

type ItemProps = {
  item: StepperItem;
  allTime: number;
  selectItem: (selectedItem: StepperItem | LightItem) => void;
  gridWidth: number;
  scale: number;
};

export const StepperItemElement: React.FC<ItemProps> = ({
  allTime,
  item,
  selectItem,
  gridWidth,
  scale,
}) => {
  const { startTime, endTime, direction } = item;

  const _selectItem = React.useCallback(() => {
    selectItem(item);
  }, [selectItem, item]);

  const width = endTime - startTime;

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
        <span>{direction}</span>
      </div>
      {crosses?.map((cross) => (
        <div
          className={styles.errorItem}
          style={{
            zIndex: 2,
            left: `${
              (scale * gridWidth * cross.crossingValueStart) / allTime
            }px`,
            width: `${
              (scale *
                gridWidth *
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
