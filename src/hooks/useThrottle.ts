import { useCallback, useRef, useEffect, useState } from 'react';

interface UseThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function useThrottle<T>(
  value: T,
  delay: number,
  options: UseThrottleOptions = {}
): T {
  const { leading = true, trailing = true } = options;
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecutedRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastValueRef = useRef(value);

  useEffect(() => {
    lastValueRef.current = value;
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutedRef.current;

    if (timeSinceLastExecution >= delay) {
      if (leading) {
        setThrottledValue(value);
        lastExecutedRef.current = now;
      }
    } else if (trailing) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setThrottledValue(lastValueRef.current);
        lastExecutedRef.current = Date.now();
      }, delay - timeSinceLastExecution);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return throttledValue;
}

export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  options: UseThrottleOptions = {}
): T {
  const { leading = true, trailing = true } = options;
  const lastExecutedRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastArgsRef = useRef<Parameters<T>>();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecutedRef.current;

      if (timeSinceLastExecution >= delay) {
        if (leading) {
          callbackRef.current(...args);
          lastExecutedRef.current = now;
        }
      } else if (trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
            lastExecutedRef.current = Date.now();
          }
        }, delay - timeSinceLastExecution);
      }
    },
    [delay, leading, trailing]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}
