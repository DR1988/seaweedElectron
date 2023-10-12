import React, { ReactNode } from 'react';
import styles from './column.module.css';

export type ColumnProps = {
  className?: string | undefined;
} & { children?: ReactNode };

export const Column: React.FC<ColumnProps> = ({ children, className }) => {
  return <div className={`${className} ${styles.container}`}>{children}</div>;
};
