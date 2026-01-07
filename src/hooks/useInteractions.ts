import { useRef, useEffect, useCallback, useState } from 'react';

export function useClickOutside<T extends HTMLElement>(
  callback: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}

export function useHover<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleEnter = () => setIsHovered(true);
    const handleLeave = () => setIsHovered(false);

    node.addEventListener('mouseenter', handleEnter);
    node.addEventListener('mouseleave', handleLeave);

    return () => {
      node.removeEventListener('mouseenter', handleEnter);
      node.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return [ref, isHovered] as const;
}

export function useFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    node.addEventListener('focus', handleFocus);
    node.addEventListener('blur', handleBlur);

    return () => {
      node.removeEventListener('focus', handleFocus);
      node.removeEventListener('blur', handleBlur);
    };
  }, []);

  const focus = useCallback(() => ref.current?.focus(), []);
  const blur = useCallback(() => ref.current?.blur(), []);

  return { ref, isFocused, focus, blur };
}

export function useLongPress(
  callback: () => void,
  duration: number = 500
) {
  const timerRef = useRef<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const start = useCallback(() => {
    setIsPressed(true);
    timerRef.current = window.setTimeout(() => {
      callback();
    }, duration);
  }, [callback, duration]);

  const stop = useCallback(() => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    isPressed
  };
}

export function useDoubleClick(
  onDoubleClick: () => void,
  onSingleClick?: () => void,
  delay: number = 300
) {
  const timerRef = useRef<number | null>(null);
  const clickCountRef = useRef(0);

  const handleClick = useCallback(() => {
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      timerRef.current = window.setTimeout(() => {
        if (clickCountRef.current === 1) {
          onSingleClick?.();
        }
        clickCountRef.current = 0;
      }, delay);
    } else if (clickCountRef.current === 2) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      onDoubleClick();
      clickCountRef.current = 0;
    }
  }, [onDoubleClick, onSingleClick, delay]);

  return handleClick;
}
