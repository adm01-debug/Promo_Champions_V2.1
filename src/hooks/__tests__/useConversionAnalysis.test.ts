import { renderHook } from '@testing-library/react';
import { useConversionAnalysis } from '../useConversionAnalysis';

describe('useConversionAnalysis', () => {
  it('analyzes conversion rates', () => {
    const { result } = renderHook(() => useConversionAnalysis());
    expect(result.current.rate).toBeGreaterThanOrEqual(0);
  });
});
