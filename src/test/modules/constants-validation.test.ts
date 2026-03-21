/**
 * Constants Validation Tests
 * Tests: all system constants for correct values and types
 */
import { describe, it, expect } from 'vitest';
import {
  CACHE_TIMES,
  RATE_LIMITS,
  VALIDATION,
  PAGINATION,
  DEAL_STATUS,
  ACTIVITY_TYPE,
  TIMEOUTS,
  ERROR_MESSAGES,
} from '@/constants';

describe('CACHE_TIMES', () => {
  it('should have positive stale time', () => {
    expect(CACHE_TIMES.STALE_TIME).toBeGreaterThan(0);
  });

  it('should have GC time >= stale time', () => {
    expect(CACHE_TIMES.GC_TIME).toBeGreaterThanOrEqual(CACHE_TIMES.STALE_TIME);
  });

  it('should have refetch interval >= stale time', () => {
    expect(CACHE_TIMES.REFETCH_INTERVAL).toBeGreaterThanOrEqual(CACHE_TIMES.STALE_TIME);
  });

  it('should be in milliseconds (reasonable ranges)', () => {
    expect(CACHE_TIMES.STALE_TIME).toBeLessThan(60 * 60 * 1000); // < 1 hour
    expect(CACHE_TIMES.GC_TIME).toBeLessThan(2 * 60 * 60 * 1000); // < 2 hours
  });
});

describe('RATE_LIMITS', () => {
  it('should have reasonable requests per hour', () => {
    expect(RATE_LIMITS.REQUESTS_PER_HOUR).toBeGreaterThanOrEqual(10);
    expect(RATE_LIMITS.REQUESTS_PER_HOUR).toBeLessThanOrEqual(10000);
  });

  it('should have window in milliseconds', () => {
    expect(RATE_LIMITS.WINDOW_MS).toBe(60 * 60 * 1000);
  });
});

describe('VALIDATION', () => {
  it('should have reasonable max string length', () => {
    expect(VALIDATION.MAX_STRING_LENGTH).toBeGreaterThan(0);
    expect(VALIDATION.MAX_STRING_LENGTH).toBeLessThanOrEqual(10000);
  });

  it('should have reasonable max array size', () => {
    expect(VALIDATION.MAX_ARRAY_SIZE).toBeGreaterThan(0);
  });

  it('should have allowed filter keys', () => {
    expect(VALIDATION.ALLOWED_FILTER_KEYS.length).toBeGreaterThan(0);
    expect(VALIDATION.ALLOWED_FILTER_KEYS).toContain('userId');
    expect(VALIDATION.ALLOWED_FILTER_KEYS).toContain('status');
  });
});

describe('PAGINATION', () => {
  it('should have default page size', () => {
    expect(PAGINATION.DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
    expect(PAGINATION.DEFAULT_PAGE_SIZE).toBeLessThanOrEqual(PAGINATION.MAX_PAGE_SIZE);
  });

  it('should have max page size >= default', () => {
    expect(PAGINATION.MAX_PAGE_SIZE).toBeGreaterThanOrEqual(PAGINATION.DEFAULT_PAGE_SIZE);
  });

  it('should start on page 1', () => {
    expect(PAGINATION.DEFAULT_PAGE).toBe(1);
  });
});

describe('DEAL_STATUS', () => {
  it('should have all expected statuses', () => {
    expect(DEAL_STATUS.DRAFT).toBe('draft');
    expect(DEAL_STATUS.OPEN).toBe('open');
    expect(DEAL_STATUS.WON).toBe('won');
    expect(DEAL_STATUS.LOST).toBe('lost');
    expect(DEAL_STATUS.CANCELLED).toBe('cancelled');
  });

  it('should have 5 total statuses', () => {
    expect(Object.keys(DEAL_STATUS)).toHaveLength(5);
  });
});

describe('ACTIVITY_TYPE', () => {
  it('should have all expected types', () => {
    expect(ACTIVITY_TYPE.CALL).toBe('call');
    expect(ACTIVITY_TYPE.EMAIL).toBe('email');
    expect(ACTIVITY_TYPE.MEETING).toBe('meeting');
    expect(ACTIVITY_TYPE.TASK).toBe('task');
    expect(ACTIVITY_TYPE.NOTE).toBe('note');
  });
});

describe('TIMEOUTS', () => {
  it('should have reasonable API timeout', () => {
    expect(TIMEOUTS.API_TIMEOUT).toBeGreaterThanOrEqual(5000);
    expect(TIMEOUTS.API_TIMEOUT).toBeLessThanOrEqual(120000);
  });

  it('should have debounce < throttle', () => {
    expect(TIMEOUTS.DEBOUNCE).toBeLessThan(TIMEOUTS.THROTTLE);
  });
});

describe('ERROR_MESSAGES', () => {
  it('should have all required messages', () => {
    expect(ERROR_MESSAGES.GENERIC).toBeTruthy();
    expect(ERROR_MESSAGES.NETWORK).toBeTruthy();
    expect(ERROR_MESSAGES.UNAUTHORIZED).toBeTruthy();
    expect(ERROR_MESSAGES.NOT_FOUND).toBeTruthy();
    expect(ERROR_MESSAGES.VALIDATION).toBeTruthy();
  });

  it('should be in Portuguese', () => {
    expect(ERROR_MESSAGES.GENERIC).toMatch(/erro|tente/i);
    expect(ERROR_MESSAGES.UNAUTHORIZED).toMatch(/permissão/i);
  });

  it('should not be empty strings', () => {
    Object.values(ERROR_MESSAGES).forEach(msg => {
      expect(msg.length).toBeGreaterThan(5);
    });
  });
});