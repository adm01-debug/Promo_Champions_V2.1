import { useCallback, useMemo } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface UseHapticFeedbackOptions {
  enabled?: boolean;
}

/**
 * useHapticFeedback - Hook for triggering vibration feedback on mobile devices
 * Uses the Vibration API for tactile feedback
 */
export function useHapticFeedback(options: UseHapticFeedbackOptions = {}) {
  const { enabled = true } = options;

  // Check if vibration is supported
  const isSupported = useMemo(() => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }, []);

  // Vibration patterns in milliseconds
  const patterns: Record<HapticPattern, number | number[]> = useMemo(() => ({
    light: 10,
    medium: 25,
    heavy: 50,
    success: [10, 50, 10, 50, 30], // Short-pause-short-pause-long
    warning: [30, 50, 30], // Medium-pause-medium
    error: [50, 100, 50, 100, 50], // Long-pause-long-pause-long
    selection: 5,
  }), []);

  const vibrate = useCallback((pattern: HapticPattern | number | number[]) => {
    if (!enabled || !isSupported) return;

    try {
      if (typeof pattern === 'string') {
        navigator.vibrate(patterns[pattern]);
      } else {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      // Vibration not supported or failed silently
    }
  }, [enabled, isSupported, patterns]);

  const light = useCallback(() => vibrate('light'), [vibrate]);
  const medium = useCallback(() => vibrate('medium'), [vibrate]);
  const heavy = useCallback(() => vibrate('heavy'), [vibrate]);
  const success = useCallback(() => vibrate('success'), [vibrate]);
  const warning = useCallback(() => vibrate('warning'), [vibrate]);
  const error = useCallback(() => vibrate('error'), [vibrate]);
  const selection = useCallback(() => vibrate('selection'), [vibrate]);

  // Stop any ongoing vibration
  const cancel = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(0);
    }
  }, [isSupported]);

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    cancel,
    isSupported,
  };
}
