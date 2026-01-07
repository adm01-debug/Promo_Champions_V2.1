import { useState, useCallback, useRef, useEffect } from 'react';

interface LongPressOptions {
  threshold?: number;
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
}

export function useLongPress(
  callback: () => void,
  options: LongPressOptions = {}
) {
  const { threshold = 500, onStart, onFinish, onCancel } = options;

  const [isPressed, setIsPressed] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const targetRef = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      targetRef.current = event.target;
      setIsPressed(true);
      onStart?.();

      timeoutRef.current = setTimeout(() => {
        setIsLongPress(true);
        callback();
        onFinish?.();
      }, threshold);
    },
    [callback, onStart, onFinish, threshold]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPressed(false);
    if (isPressed && !isLongPress) {
      onCancel?.();
    }
    setIsLongPress(false);
    targetRef.current = null;
  }, [isPressed, isLongPress, onCancel]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    isPressed,
    isLongPress,
  };
}

// Double-tap hook for mobile
export function useDoubleTap(
  callback: () => void,
  delay: number = 300
) {
  const lastTapRef = useRef<number>(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < delay) {
      callback();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [callback, delay]);

  return handleTap;
}

// Swipe detection hook
type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeOptions {
  threshold?: number;
  onSwipe?: (direction: SwipeDirection) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe(options: SwipeOptions = {}) {
  const { 
    threshold = 50, 
    onSwipe, 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown 
  } = options;

  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - startXRef.current;
    const diffY = endY - startYRef.current;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (absX < threshold && absY < threshold) return;

    let direction: SwipeDirection;

    if (absX > absY) {
      direction = diffX > 0 ? 'right' : 'left';
      if (direction === 'left') onSwipeLeft?.();
      if (direction === 'right') onSwipeRight?.();
    } else {
      direction = diffY > 0 ? 'down' : 'up';
      if (direction === 'up') onSwipeUp?.();
      if (direction === 'down') onSwipeDown?.();
    }

    onSwipe?.(direction);
  }, [threshold, onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}
