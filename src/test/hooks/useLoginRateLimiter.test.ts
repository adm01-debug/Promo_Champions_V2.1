/**
 * Login Rate Limiter Logic Tests
 * Tests: lockout calculations, time formatting, exponential backoff
 */
import { describe, it, expect } from 'vitest';

describe('Login Rate Limiter - Lockout Duration', () => {
  const BASE_LOCKOUT_SECONDS = 30;
  const MAX_ATTEMPTS = 5;

  const calculateLockoutDuration = (failedSeries: number): number => {
    return BASE_LOCKOUT_SECONDS * Math.pow(2, failedSeries - 1);
  };

  it('should return 30s for first series', () => {
    expect(calculateLockoutDuration(1)).toBe(30);
  });

  it('should double each series', () => {
    expect(calculateLockoutDuration(2)).toBe(60);
    expect(calculateLockoutDuration(3)).toBe(120);
    expect(calculateLockoutDuration(4)).toBe(240);
    expect(calculateLockoutDuration(5)).toBe(480);
  });

  it('should grow exponentially', () => {
    for (let i = 2; i <= 5; i++) {
      expect(calculateLockoutDuration(i)).toBe(calculateLockoutDuration(i - 1) * 2);
    }
  });

  it('should calculate series from consecutive failures', () => {
    const getSeriesFromFailures = (failures: number) => Math.floor(failures / MAX_ATTEMPTS);
    expect(getSeriesFromFailures(5)).toBe(1);
    expect(getSeriesFromFailures(10)).toBe(2);
    expect(getSeriesFromFailures(15)).toBe(3);
    expect(getSeriesFromFailures(4)).toBe(0);
  });
});

describe('Login Rate Limiter - Time Formatting', () => {
  const formatRemainingTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  it('should format 1 second singular', () => {
    expect(formatRemainingTime(1)).toBe('1 segundo');
  });

  it('should format seconds plural', () => {
    expect(formatRemainingTime(30)).toBe('30 segundos');
    expect(formatRemainingTime(5)).toBe('5 segundos');
  });

  it('should format exact minutes', () => {
    expect(formatRemainingTime(60)).toBe('1 minuto');
    expect(formatRemainingTime(120)).toBe('2 minutos');
  });

  it('should format minutes and seconds', () => {
    expect(formatRemainingTime(90)).toBe('1m 30s');
    expect(formatRemainingTime(150)).toBe('2m 30s');
  });

  it('should handle 0 seconds', () => {
    expect(formatRemainingTime(0)).toBe('0 segundos');
  });
});

describe('Login Rate Limiter - Lockout Status Check', () => {
  const isLocked = (lastAttemptTime: number, lockoutDuration: number): boolean => {
    const lockoutEndTime = lastAttemptTime + lockoutDuration * 1000;
    return Date.now() < lockoutEndTime;
  };

  it('should be locked within lockout window', () => {
    expect(isLocked(Date.now(), 30)).toBe(true);
  });

  it('should be unlocked after lockout expires', () => {
    expect(isLocked(Date.now() - 60000, 30)).toBe(false);
  });

  it('should handle zero lockout duration', () => {
    expect(isLocked(Date.now(), 0)).toBe(false);
  });
});

describe('Login Rate Limiter - Email Normalization', () => {
  const normalizeEmail = (email: string) => email.toLowerCase().trim();

  it('should lowercase', () => {
    expect(normalizeEmail('USER@TEST.COM')).toBe('user@test.com');
  });

  it('should trim whitespace', () => {
    expect(normalizeEmail('  user@test.com  ')).toBe('user@test.com');
  });

  it('should handle mixed case with spaces', () => {
    expect(normalizeEmail(' Admin@Company.COM ')).toBe('admin@company.com');
  });
});
