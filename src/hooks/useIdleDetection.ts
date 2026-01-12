import { useState, useCallback, useEffect, useRef } from 'react';

interface UseIdleDetectionReturn {
  isIdle: boolean;
  idleTime: number;
  lastActivity: number;
  resetIdleTimer: () => void;
}

export const useIdleDetection = (
  idleTimeout = 300000, // 5 minutes default
  onIdle?: () => void,
  onActive?: () => void
): UseIdleDetectionReturn => {
  const [isIdle, setIsIdle] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    setIdleTime(0);
    
    if (isIdle) {
      setIsIdle(false);
      onActive?.();
    }

    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Set new idle timer
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle?.();
    }, idleTimeout);
  }, [isIdle, idleTimeout, onIdle, onActive]);

  // Track idle time
  useEffect(() => {
    idleIntervalRef.current = setInterval(() => {
      const now = Date.now();
      setIdleTime(now - lastActivity);
    }, 1000);

    return () => {
      if (idleIntervalRef.current) {
        clearInterval(idleIntervalRef.current);
      }
    };
  }, [lastActivity]);

  // Set up activity listeners
  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'wheel',
    ];

    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Initialize timer
    resetIdleTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer]);

  return {
    isIdle,
    idleTime,
    lastActivity,
    resetIdleTimer,
  };
};

// Format idle time for display
export const formatIdleTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};
