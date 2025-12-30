// Melhoria 26
import { describe, it, expect } from 'vitest';
import { useConversionAnalysis } from '../useConversionAnalysis';

describe('useConversionAnalysis', () => {
  it('should calculate overall conversion rate', () => {
    const { result } = renderHook(() => useConversionAnalysis());

    expect(result.current.overallConversionRate).toBeDefined();
    expect(result.current.overallConversionRate).toBeGreaterThan(0);
    expect(result.current.overallConversionRate).toBeLessThan(100);
  });

  it('should break down conversion by source', () => {
    const { result } = renderHook(() => useConversionAnalysis());

    expect(result.current.conversionBySource).toBeDefined();
    Object.keys(result.current.conversionBySource).forEach((source) => {
      expect(result.current.conversionBySource[source]).toBeGreaterThan(0);
    });
  });
});
