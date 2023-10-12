import React, { PropsWithChildren, useEffect, useRef } from 'react';
import styles from './modal.module.css';

export type ModalProps = {
  closeModal: () => void;
  shouldCloseOnEsp?: boolean;
} & PropsWithChildren;

export const Modal: React.FC<ModalProps> = ({
  closeModal,
  shouldCloseOnEsp,
  children,
}) => {
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    coverRef?.current?.focus();
  }, []);

  return (
    <div
      ref={coverRef}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (shouldCloseOnEsp && e.keyCode === 27) {
          closeModal();
        }
      }}
      className={styles.modal}
      tabIndex={1}
    >
      <div className={styles['modal-content']}>
        <div className={styles.closeContent}>
          <button onClick={closeModal} className={styles.buttonContent}>
            <div className={`${styles.cross} ${styles.left}`} />
            <div className={`${styles.cross} ${styles.right}`} />
          </button>
          <section className={styles.closeSign}>
            <span>Закрыть</span>
          </section>
        </div>
        {children}
      </div>
    </div>
  );
};
