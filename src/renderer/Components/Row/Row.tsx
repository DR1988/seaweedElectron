import React, { ReactNode } from 'react';
import styles from './row.module.css';

export type RowProps = {
  className?: string | undefined;
} & { children?: ReactNode };

export const Row: React.FC<RowProps> = ({ children, className }) => {
  return <div className={`${className} ${styles.container}`}>{children}</div>;
};
