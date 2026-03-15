/**
 * Constants & Validation Tests
 * Tests: all constant values, boundary checks, type safety
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

describe('Constants', () => {
  describe('CACHE_TIMES', () => {
    it('should have positive stale time', () => {
      expect(CACHE_TIMES.STALE_TIME).toBeGreaterThan(0);
    });

    it('GC_TIME should be greater than STALE_TIME', () => {
      expect(CACHE_TIMES.GC_TIME).toBeGreaterThan(CACHE_TIMES.STALE_TIME);
    });

    it('REFETCH_INTERVAL should be reasonable (< 1h)', () => {
      expect(CACHE_TIMES.REFETCH_INTERVAL).toBeLessThanOrEqual(60 * 60 * 1000);
    });
  });

  describe('RATE_LIMITS', () => {
    it('should allow reasonable requests per hour', () => {
      expect(RATE_LIMITS.REQUESTS_PER_HOUR).toBeGreaterThan(0);
      expect(RATE_LIMITS.REQUESTS_PER_HOUR).toBeLessThanOrEqual(1000);
    });

    it('window should be exactly 1 hour', () => {
      expect(RATE_LIMITS.WINDOW_MS).toBe(60 * 60 * 1000);
    });
  });

  describe('VALIDATION', () => {
    it('MAX_STRING_LENGTH should be reasonable', () => {
      expect(VALIDATION.MAX_STRING_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION.MAX_STRING_LENGTH).toBeLessThanOrEqual(10000);
    });

    it('MAX_ARRAY_SIZE should prevent abuse', () => {
      expect(VALIDATION.MAX_ARRAY_SIZE).toBeGreaterThan(0);
      expect(VALIDATION.MAX_ARRAY_SIZE).toBeLessThanOrEqual(1000);
    });

    it('should have expected filter keys', () => {
      expect(VALIDATION.ALLOWED_FILTER_KEYS).toContain('userId');
      expect(VALIDATION.ALLOWED_FILTER_KEYS).toContain('status');
      expect(VALIDATION.ALLOWED_FILTER_KEYS).toContain('dateRange');
    });

    it('should not have empty filter keys', () => {
      VALIDATION.ALLOWED_FILTER_KEYS.forEach(key => {
        expect(key.length).toBeGreaterThan(0);
      });
    });
  });

  describe('PAGINATION', () => {
    it('DEFAULT_PAGE_SIZE should be reasonable', () => {
      expect(PAGINATION.DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
      expect(PAGINATION.DEFAULT_PAGE_SIZE).toBeLessThanOrEqual(100);
    });

    it('MAX_PAGE_SIZE should be >= DEFAULT_PAGE_SIZE', () => {
      expect(PAGINATION.MAX_PAGE_SIZE).toBeGreaterThanOrEqual(PAGINATION.DEFAULT_PAGE_SIZE);
    });

    it('DEFAULT_PAGE should be 1', () => {
      expect(PAGINATION.DEFAULT_PAGE).toBe(1);
    });
  });

  describe('DEAL_STATUS', () => {
    it('should have all required statuses', () => {
      expect(DEAL_STATUS.OPEN).toBe('open');
      expect(DEAL_STATUS.WON).toBe('won');
      expect(DEAL_STATUS.LOST).toBe('lost');
    });

    it('values should be unique', () => {
      const values = Object.values(DEAL_STATUS);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });
  });

  describe('ACTIVITY_TYPE', () => {
    it('should have all required types', () => {
      expect(ACTIVITY_TYPE.CALL).toBe('call');
      expect(ACTIVITY_TYPE.EMAIL).toBe('email');
      expect(ACTIVITY_TYPE.MEETING).toBe('meeting');
    });

    it('values should be unique', () => {
      const values = Object.values(ACTIVITY_TYPE);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });
  });

  describe('TIMEOUTS', () => {
    it('API_TIMEOUT should be reasonable (5s-60s)', () => {
      expect(TIMEOUTS.API_TIMEOUT).toBeGreaterThanOrEqual(5000);
      expect(TIMEOUTS.API_TIMEOUT).toBeLessThanOrEqual(60000);
    });

    it('DEBOUNCE should be < 1 second', () => {
      expect(TIMEOUTS.DEBOUNCE).toBeLessThan(1000);
    });

    it('THROTTLE should be >= DEBOUNCE', () => {
      expect(TIMEOUTS.THROTTLE).toBeGreaterThanOrEqual(TIMEOUTS.DEBOUNCE);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('all messages should be non-empty strings', () => {
      Object.values(ERROR_MESSAGES).forEach(msg => {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      });
    });

    it('should have all required error types', () => {
      expect(ERROR_MESSAGES.GENERIC).toBeDefined();
      expect(ERROR_MESSAGES.NETWORK).toBeDefined();
      expect(ERROR_MESSAGES.UNAUTHORIZED).toBeDefined();
      expect(ERROR_MESSAGES.NOT_FOUND).toBeDefined();
      expect(ERROR_MESSAGES.VALIDATION).toBeDefined();
    });
  });
});
