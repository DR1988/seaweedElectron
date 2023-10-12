import styles from './timeArrow.module.css';
import React, { CSSProperties, MutableRefObject } from 'react';

export type Props = {
  elementRef?: MutableRefObject<HTMLDivElement | null>;
  visible?: boolean;
  style?: CSSProperties | undefined;
  id?: string;
};

export const TimeArrow: React.FC<Props> = ({
  elementRef = null,
  visible = true,
  style,
  id,
}) => {
  return (
    <div
      tabIndex={-1}
      id={id}
      ref={elementRef}
      className={styles.container}
      style={{
        visibility: visible ? 'visible' : 'hidden',
        position: visible ? 'absolute' : 'fixed',
        ...style,
      }}
    >
      <div id="lineElement" className={styles.arrowLine} />
      <div className={styles.arrowContainer}>
        <div className={styles.arrow} />
        <div className={styles.block} />
      </div>
    </div>
  );
};
