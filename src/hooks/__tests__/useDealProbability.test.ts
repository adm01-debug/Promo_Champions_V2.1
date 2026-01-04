import { renderHook } from '@testing-library/react';
import { useDealProbability } from '../useDealProbability';

describe('useDealProbability', () => {
  it('calculates deal probability', () => {
    const { result } = renderHook(() => useDealProbability('deal1'));
    expect(result.current.probability).toBeGreaterThanOrEqual(0);
  });
});
