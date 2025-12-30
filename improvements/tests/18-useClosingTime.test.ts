// Melhoria 18 - useClosingTime.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClosingTime } from '../useClosingTime';

describe('useClosingTime', () => {
  it('should calculate average closing time', () => {
    const { result } = renderHook(() =>
      useClosingTime({ dealId: 'deal-123' })
    );

    expect(result.current.avgClosingTime).toBeDefined();
    expect(typeof result.current.avgClosingTime).toBe('number');
  });

  it('should identify slow-moving deals', () => {
    const { result } = renderHook(() => useClosingTime());

    const slowDeals = result.current.slowDeals;
    expect(Array.isArray(slowDeals)).toBe(true);
    slowDeals.forEach((deal) => {
      expect(deal.days_open).toBeGreaterThan(30);
    });
  });

  it('should predict closing date', () => {
    const { result } = renderHook(() =>
      useClosingTime({ dealId: 'deal-123' })
    );

    expect(result.current.predictedClosingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
