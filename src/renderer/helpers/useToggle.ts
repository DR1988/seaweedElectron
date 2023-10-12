import { useState } from 'react';

export const useToggle = (initialState: boolean = false) => {
  const [state, changeState] = useState(initialState)

  const setTrue = () => changeState(true)
  const setFalse = () => changeState(false)

  return [state, setTrue, setFalse] as const
}
