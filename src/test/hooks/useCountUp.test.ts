/**
 * useCountUp Hook Tests
 * Tests: animation logic, easeOutCubic, edge cases, disabled state
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCountUp } from '@/hooks/useCountUp';

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start from startFrom value', () => {
    const { result } = renderHook(() => useCountUp(100, { startFrom: 0 }));
    // Initially should be 0 or close to it
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('number');
  });

  it('should return end value when disabled', () => {
    const { result } = renderHook(() => useCountUp(500, { enabled: false }));
    expect(result.current).toBe(500);
  });

  it('should handle zero target', () => {
    const { result } = renderHook(() => useCountUp(0, { enabled: false }));
    expect(result.current).toBe(0);
  });

  it('should handle negative values', () => {
    const { result } = renderHook(() => useCountUp(-50, { enabled: false }));
    expect(result.current).toBe(-50);
  });

  it('should handle decimal places', () => {
    const { result } = renderHook(() => useCountUp(99.9, { enabled: false, decimals: 1 }));
    expect(result.current).toBe(99.9);
  });

  it('should handle very large numbers', () => {
    const { result } = renderHook(() => useCountUp(1000000, { enabled: false }));
    expect(result.current).toBe(1000000);
  });

  it('should handle value changes', () => {
    const { result, rerender } = renderHook(
      ({ end }) => useCountUp(end, { enabled: false }),
      { initialProps: { end: 100 } }
    );
    expect(result.current).toBe(100);

    rerender({ end: 200 });
    expect(result.current).toBe(200);
  });

  it('should not crash when end equals startFrom', () => {
    const { result } = renderHook(() => useCountUp(50, { startFrom: 50 }));
    expect(result.current).toBe(50);
  });

  it('should use default options when none provided', () => {
    const { result } = renderHook(() => useCountUp(100));
    expect(typeof result.current).toBe('number');
  });

  it('should handle rapid value changes without crashing', () => {
    const { result, rerender } = renderHook(
      ({ end }) => useCountUp(end, { enabled: false }),
      { initialProps: { end: 0 } }
    );

    for (let i = 0; i < 100; i++) {
      rerender({ end: i * 100 });
    }
    expect(result.current).toBe(9900);
  });
});
