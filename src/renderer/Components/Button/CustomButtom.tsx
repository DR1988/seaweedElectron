import React from 'react';
import styles from './customButtom.module.css';

export type CustomButtonType = {
  handleClick: () => void;
  title: string;
  disabled?: boolean;
};

export const CustomButton: React.FC<CustomButtonType> = ({
  handleClick,
  title,
  disabled,
}) => {
  return (
    <button
      className={`${styles.container} ${disabled && styles.disabled_button}`}
      onClick={handleClick}
    >
      {title}
    </button>
  );
};
