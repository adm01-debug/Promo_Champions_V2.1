// Melhoria 24
import { describe, it, expect } from 'vitest';
import { useDealProbability } from '../useDealProbability';

describe('useDealProbability', () => {
  it('should calculate win probability', () => {
    const { result } = renderHook(() =>
      useDealProbability({ dealId: 'deal-123' })
    );

    expect(result.current.winProbability).toBeDefined();
    expect(typeof result.current.winProbability).toBe('number');
  });

  it('should increase probability as deal progresses', () => {
    const early = renderHook(() =>
      useDealProbability({ dealId: 'deal-1', stage: 'qualification' })
    ).result.current.winProbability;

    const late = renderHook(() =>
      useDealProbability({ dealId: 'deal-2', stage: 'negotiation' })
    ).result.current.winProbability;

    expect(late).toBeGreaterThan(early);
  });
});
