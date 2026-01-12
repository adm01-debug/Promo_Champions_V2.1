import { useState, useCallback, useRef, useEffect } from 'react';

interface TimerState {
  time: number;
  isRunning: boolean;
  isPaused: boolean;
}

interface UseTimerReturn extends TimerState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (time: number) => void;
  formattedTime: string;
}

// Countdown timer
export const useCountdown = (
  initialTime: number,
  onComplete?: () => void,
  interval = 1000
): UseTimerReturn => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setIsRunning(true);
    setIsPaused(false);
    
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= interval) {
          clearTimer();
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - interval;
      });
    }, interval);
  }, [interval, onComplete, clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    start();
  }, [isPaused, start]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setTime(initialTime);
  }, [initialTime, clearTimer]);

  const reset = useCallback(() => {
    setTime(initialTime);
    if (isRunning) {
      clearTimer();
      start();
    }
  }, [initialTime, isRunning, clearTimer, start]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    time,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    setTime,
    formattedTime: formatTime(time),
  };
};

// Stopwatch (count up)
export const useStopwatch = (interval = 1000): UseTimerReturn => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isRunning && !isPaused) return;
    
    clearTimer();
    startTimeRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current + accumulatedRef.current;
      setTime(elapsed);
    }, interval);
  }, [interval, isRunning, isPaused, clearTimer]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    
    clearTimer();
    accumulatedRef.current = time;
    setIsPaused(true);
  }, [isRunning, time, clearTimer]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    start();
  }, [isPaused, start]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    accumulatedRef.current = 0;
    setTime(0);
  }, [clearTimer]);

  const reset = useCallback(() => {
    accumulatedRef.current = 0;
    setTime(0);
    if (isRunning && !isPaused) {
      startTimeRef.current = Date.now();
    }
  }, [isRunning, isPaused]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    time,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    setTime,
    formattedTime: formatTime(time),
  };
};
