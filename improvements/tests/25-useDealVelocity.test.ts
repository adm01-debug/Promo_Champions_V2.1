// Melhoria 25
import { describe, it, expect } from 'vitest';
import { useDealVelocity } from '../useDealVelocity';

describe('useDealVelocity', () => {
  it('should calculate average days in each stage', () => {
    const { result } = renderHook(() => useDealVelocity());

    expect(result.current.avgDaysPerStage).toBeDefined();
    Object.values(result.current.avgDaysPerStage).forEach((days) => {
      expect(days).toBeGreaterThan(0);
    });
  });

  it('should identify stuck deals', () => {
    const { result } = renderHook(() => useDealVelocity());

    result.current.stuckDeals.forEach((deal) => {
      expect(deal.daysInStage).toBeGreaterThan(30);
    });
  });
});
