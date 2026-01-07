import { useState, useCallback } from 'react';

interface CounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

interface CounterActions {
  increment: () => void;
  decrement: () => void;
  set: (value: number) => void;
  reset: () => void;
  incrementBy: (amount: number) => void;
  decrementBy: (amount: number) => void;
}

export function useCounter(
  initialValue: number = 0,
  options: CounterOptions = {}
): [number, CounterActions] {
  const { min = -Infinity, max = Infinity, step = 1 } = options;
  const [count, setCount] = useState(initialValue);

  const clamp = useCallback(
    (value: number) => Math.min(Math.max(value, min), max),
    [min, max]
  );

  const increment = useCallback(() => {
    setCount(prev => clamp(prev + step));
  }, [clamp, step]);

  const decrement = useCallback(() => {
    setCount(prev => clamp(prev - step));
  }, [clamp, step]);

  const set = useCallback(
    (value: number) => setCount(clamp(value)),
    [clamp]
  );

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const incrementBy = useCallback(
    (amount: number) => setCount(prev => clamp(prev + amount)),
    [clamp]
  );

  const decrementBy = useCallback(
    (amount: number) => setCount(prev => clamp(prev - amount)),
    [clamp]
  );

  return [count, { increment, decrement, set, reset, incrementBy, decrementBy }];
}
