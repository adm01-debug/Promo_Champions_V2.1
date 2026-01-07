import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface HapticPatterns {
  light: number[];
  medium: number[];
  heavy: number[];
  success: number[];
  warning: number[];
  error: number[];
  selection: number[];
}

const patterns: HapticPatterns = {
  light: [10],
  medium: [30],
  heavy: [50],
  success: [30, 50, 30],
  warning: [50, 30, 50],
  error: [100, 50, 100],
  selection: [10],
};

export const useHapticFeedback = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  const isMobile = typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const trigger = useCallback((pattern: HapticPattern = 'light') => {
    if (!isSupported || !isMobile) return false;
    
    try {
      navigator.vibrate(patterns[pattern]);
      return true;
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      return false;
    }
  }, [isSupported, isMobile]);

  const customVibrate = useCallback((pattern: number[]) => {
    if (!isSupported || !isMobile) return false;
    
    try {
      navigator.vibrate(pattern);
      return true;
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      return false;
    }
  }, [isSupported, isMobile]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    navigator.vibrate(0);
  }, [isSupported]);

  // Create haptic-enabled handler wrapper
  const withHaptic = useCallback(<T extends (...args: unknown[]) => unknown>(
    handler: T,
    pattern: HapticPattern = 'light'
  ) => {
    return (...args: Parameters<T>) => {
      trigger(pattern);
      return handler(...args);
    };
  }, [trigger]);

  return {
    isSupported: isSupported && isMobile,
    trigger,
    customVibrate,
    stop,
    withHaptic,
    // Convenience methods
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
    success: () => trigger('success'),
    warning: () => trigger('warning'),
    error: () => trigger('error'),
    selection: () => trigger('selection'),
  };
};

// Hook for automatic haptic on click/tap
export const useHapticButton = (pattern: HapticPattern = 'light') => {
  const { trigger, isSupported } = useHapticFeedback();

  const onClick = useCallback((callback?: () => void) => {
    return () => {
      trigger(pattern);
      callback?.();
    };
  }, [trigger, pattern]);

  return { onClick, isSupported };
};
