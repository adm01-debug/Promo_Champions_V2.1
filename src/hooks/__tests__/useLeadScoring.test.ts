import { renderHook } from '@testing-library/react';
import { useLeadScoring } from '../useLeadScoring';

describe('useLeadScoring', () => {
  it('scores leads correctly', () => {
    const { result } = renderHook(() => useLeadScoring());
    expect(result.current.score).toBeGreaterThanOrEqual(0);
    expect(result.current.score).toBeLessThanOrEqual(100);
  });
});
