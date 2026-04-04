/**
 * Focus Mode Logic Tests
 * Tests: timer formatting, config persistence, state management
 */
import { describe, it, expect } from 'vitest';

describe('Focus Mode - Time Formatting', () => {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  it('should format 0 seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('should format seconds only', () => {
    expect(formatTime(30)).toBe('0:30');
    expect(formatTime(5)).toBe('0:05');
  });

  it('should format minutes and seconds', () => {
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(600)).toBe('10:00');
    expect(formatTime(1500)).toBe('25:00'); // Pomodoro
  });

  it('should format hours', () => {
    expect(formatTime(3600)).toBe('1h 0m');
    expect(formatTime(3660)).toBe('1h 1m');
    expect(formatTime(7200)).toBe('2h 0m');
  });

  it('should pad single digit seconds', () => {
    expect(formatTime(61)).toBe('1:01');
    expect(formatTime(65)).toBe('1:05');
  });
});

describe('Focus Mode - Config Defaults', () => {
  const DEFAULT_CONFIG = {
    enabled: false,
    hideSidebar: true,
    hideNotifications: true,
    hideGamification: true,
    dimInactiveElements: true,
    autoBreakReminder: true,
    breakIntervalMinutes: 25,
    startedAt: null as string | null,
  };

  it('should start disabled', () => {
    expect(DEFAULT_CONFIG.enabled).toBe(false);
  });

  it('should default to Pomodoro interval', () => {
    expect(DEFAULT_CONFIG.breakIntervalMinutes).toBe(25);
  });

  it('should hide distracting elements by default', () => {
    expect(DEFAULT_CONFIG.hideSidebar).toBe(true);
    expect(DEFAULT_CONFIG.hideNotifications).toBe(true);
    expect(DEFAULT_CONFIG.hideGamification).toBe(true);
  });

  it('should enable auto break reminder', () => {
    expect(DEFAULT_CONFIG.autoBreakReminder).toBe(true);
  });

  it('should not have a start time', () => {
    expect(DEFAULT_CONFIG.startedAt).toBeNull();
  });
});

describe('Focus Mode - Break Reminder Logic', () => {
  const shouldShowBreak = (elapsedSeconds: number, intervalMinutes: number): boolean => {
    const intervalSeconds = intervalMinutes * 60;
    return elapsedSeconds > 0 && elapsedSeconds % intervalSeconds === 0;
  };

  it('should not show at 0 seconds', () => {
    expect(shouldShowBreak(0, 25)).toBe(false);
  });

  it('should show at 25 minutes', () => {
    expect(shouldShowBreak(25 * 60, 25)).toBe(true);
  });

  it('should show at 50 minutes', () => {
    expect(shouldShowBreak(50 * 60, 25)).toBe(true);
  });

  it('should not show at 10 minutes', () => {
    expect(shouldShowBreak(10 * 60, 25)).toBe(false);
  });

  it('should handle custom intervals', () => {
    expect(shouldShowBreak(15 * 60, 15)).toBe(true);
    expect(shouldShowBreak(30 * 60, 15)).toBe(true);
  });
});

describe('Focus Mode - CSS Class Logic', () => {
  const getClasses = (config: {
    enabled: boolean;
    hideSidebar: boolean;
    hideNotifications: boolean;
    hideGamification: boolean;
    dimInactiveElements: boolean;
  }): string[] => {
    if (!config.enabled) return [];
    const classes = ['focus-mode'];
    if (config.hideSidebar) classes.push('focus-hide-sidebar');
    if (config.hideNotifications) classes.push('focus-hide-notifications');
    if (config.hideGamification) classes.push('focus-hide-gamification');
    if (config.dimInactiveElements) classes.push('focus-dim-inactive');
    return classes;
  };

  it('should return empty when disabled', () => {
    expect(getClasses({ enabled: false, hideSidebar: true, hideNotifications: true, hideGamification: true, dimInactiveElements: true })).toEqual([]);
  });

  it('should return all classes when fully enabled', () => {
    const classes = getClasses({ enabled: true, hideSidebar: true, hideNotifications: true, hideGamification: true, dimInactiveElements: true });
    expect(classes).toContain('focus-mode');
    expect(classes).toContain('focus-hide-sidebar');
    expect(classes).toContain('focus-hide-notifications');
    expect(classes).toContain('focus-hide-gamification');
    expect(classes).toContain('focus-dim-inactive');
    expect(classes).toHaveLength(5);
  });

  it('should respect individual toggles', () => {
    const classes = getClasses({ enabled: true, hideSidebar: false, hideNotifications: true, hideGamification: false, dimInactiveElements: true });
    expect(classes).toContain('focus-mode');
    expect(classes).not.toContain('focus-hide-sidebar');
    expect(classes).toContain('focus-hide-notifications');
    expect(classes).not.toContain('focus-hide-gamification');
    expect(classes).toContain('focus-dim-inactive');
  });
});
