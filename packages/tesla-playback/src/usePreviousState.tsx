import { useEffect, useState } from "react";

export function usePreviousState<T>(value: T, initialValue: T = value) {
  const [prev, setPrev] = useState<T>(initialValue);
  useEffect(
    () => () => {
      setPrev(value);
    },
    [value]
  );
  return prev;
}
