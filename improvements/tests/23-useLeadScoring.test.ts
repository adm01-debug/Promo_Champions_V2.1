// Melhoria 23
import { describe, it, expect } from 'vitest';
import { useLeadScoring } from '../useLeadScoring';

describe('useLeadScoring', () => {
  it('should score lead between 0-100', () => {
    const { result } = renderHook(() =>
      useLeadScoring({ leadId: 'lead-123' })
    );

    expect(result.current.score).toBeGreaterThanOrEqual(0);
    expect(result.current.score).toBeLessThanOrEqual(100);
  });

  it('should give higher scores to qualified leads', () => {
    const { result } = renderHook(() =>
      useLeadScoring({
        leadId: 'lead-123',
        factors: { budget: 100000, timeline: 'immediate', authority: true },
      })
    );

    expect(result.current.score).toBeGreaterThan(70);
  });
});
