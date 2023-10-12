import React, { ChangeEvent } from 'react';
import styles from './customInput.module.css';

export type CustomInputProps<TValue> = {
  onChange: (value: TValue) => void;
  value: TValue;
  label: string;
  id: string;
};

export function CustomInput<
  T extends string | ReadonlyArray<string> | number | undefined
>({ onChange, value, label, id }: CustomInputProps<T>) {
  const _changeStartTime = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (
        Number.isInteger(+e.target.value.trim()) &&
        +e.target.value.trim() >= 0
      ) {
        onChange(+e.target.value as T);
      }
    },
    [onChange]
  );

  return (
    <div className={styles.container}>
      <label htmlFor={id}>{label}</label>
      <br />
      <input
        className={styles.inputContent}
        id={id}
        type="text"
        onChange={_changeStartTime}
        value={value}
      />
    </div>
  );
}
