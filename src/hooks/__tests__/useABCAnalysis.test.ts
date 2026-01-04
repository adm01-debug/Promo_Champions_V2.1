import { renderHook } from '@testing-library/react';
import { useABCAnalysis } from '../useABCAnalysis';

describe('useABCAnalysis', () => {
  it('classifies clients correctly', () => {
    const { result } = renderHook(() => useABCAnalysis());
    expect(result.current.classification).toHaveProperty('A');
  });
});
