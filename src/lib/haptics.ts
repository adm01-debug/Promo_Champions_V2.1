/**
 * Haptic feedback utility for mobile devices.
 * Uses the Vibration API when available for subtle tactile feedback.
 */

type HapticPattern = 'light' | 'medium' | 'success' | 'error';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  success: [10, 50, 20],
  error: [30, 50, 30, 50, 30],
};

export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(patterns[pattern]);
    } catch {
      // Silent fail — not all devices support vibration
    }
  }
}
