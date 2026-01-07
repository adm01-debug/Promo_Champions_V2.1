import { useState, useCallback, useRef, useEffect } from 'react';

interface UseIntervalOptions {
  immediate?: boolean;
}

export function useInterval(
  callback: () => void,
  delay: number | null,
  options?: UseIntervalOptions
) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    if (options?.immediate) {
      savedCallback.current();
    }

    intervalRef.current = window.setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay, options?.immediate]);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return clear;
}

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    timeoutRef.current = window.setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    if (delay !== null) {
      timeoutRef.current = window.setTimeout(() => {
        savedCallback.current();
      }, delay);
    }
  }, [delay, clear]);

  return { clear, reset };
}

export function useCountdown(
  initialSeconds: number,
  options?: { onComplete?: () => void; autoStart?: boolean }
) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(options?.autoStart ?? false);

  useInterval(
    () => {
      if (seconds > 0) {
        setSeconds(s => s - 1);
      } else {
        setIsRunning(false);
        options?.onComplete?.();
      }
    },
    isRunning ? 1000 : null
  );

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback((newSeconds?: number) => {
    setSeconds(newSeconds ?? initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  const formatted = {
    minutes: Math.floor(seconds / 60),
    seconds: seconds % 60,
    display: `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  };

  return {
    seconds,
    isRunning,
    isComplete: seconds === 0,
    start,
    pause,
    reset,
    ...formatted
  };
}

export function useStopwatch(options?: { autoStart?: boolean }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(options?.autoStart ?? false);

  useInterval(
    () => setSeconds(s => s + 1),
    isRunning ? 1000 : null
  );

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setSeconds(0);
    setIsRunning(false);
  }, []);

  const formatted = {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    secs: seconds % 60,
    display: `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  };

  return {
    totalSeconds: seconds,
    isRunning,
    start,
    pause,
    reset,
    ...formatted
  };
}
