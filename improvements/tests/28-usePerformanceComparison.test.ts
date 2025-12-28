// Melhoria 28
import { describe, it, expect } from 'vitest';
import { usePerformanceComparison } from '../usePerformanceComparison';

describe('usePerformanceComparison', () => {
  it('should compare user to team average', () => {
    const { result } = renderHook(() =>
      usePerformanceComparison({ userId: 'user-123' })
    );

    expect(result.current.vsTeamAverage).toBeDefined();
    expect(typeof result.current.vsTeamAverage).toBe('number');
  });

  it('should rank user among peers', () => {
    const { result } = renderHook(() =>
      usePerformanceComparison({ userId: 'user-123' })
    );

    expect(result.current.rank).toBeGreaterThan(0);
    expect(result.current.totalPeers).toBeGreaterThan(0);
  });

  it('should show trends over time', () => {
    const { result } = renderHook(() =>
      usePerformanceComparison({ userId: 'user-123' })
    );

    expect(result.current.trend).toMatch(/improving|declining|stable/);
  });
});
