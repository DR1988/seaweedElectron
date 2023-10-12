import React from 'react';

import styles from './Item.module.css';
import { LightItem, StepperItem } from '../../../Types/Types';
import { useToggle } from '../../helpers/useToggle';
import { BrightModal } from '../Modals/BrightModal';

type ItemProps = {
  item: LightItem;
  allTime: number;
  selectItem: (selectedItem: StepperItem | LightItem) => void;
  gridWidth: number;
  scale: number;
};

export const BrightItemElement: React.FC<ItemProps> = ({
  item,
  allTime,
  selectItem,
  gridWidth,
  scale,
}) => {
  const { startTime, endTime, brightness, brightnessEnd } = item;

  const width = endTime - startTime;
  console.log('--------------------');
  console.log('width', width, gridWidth * width * scale);
  console.log('width all div', (gridWidth * startTime * scale) / 60 / 60);
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
          left: `${(gridWidth * startTime * scale) / 60 / 60 / 24}px`,
          width: `${(gridWidth * width * scale) / 60 / 60 / 24}px`,
        }}
      >
        {brightnessEnd ? (
          <span>
            {brightness} - {brightnessEnd}
          </span>
        ) : (
          <span>{brightness}</span>
        )}
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
