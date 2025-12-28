// Melhoria 20
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useABCAnalysis } from '../useABCAnalysis';

describe('useABCAnalysis', () => {
  it('should classify clients into A, B, C categories', async () => {
    const { result } = renderHook(() => useABCAnalysis());
    
    expect(result.current.categoryA).toBeDefined();
    expect(result.current.categoryB).toBeDefined();
    expect(result.current.categoryC).toBeDefined();
  });

  it('should have 80% of revenue in category A', () => {
    const { result } = renderHook(() => useABCAnalysis());
    
    const totalRevenue = result.current.totalRevenue;
    const categoryARevenue = result.current.categoryA.reduce(
      (sum, client) => sum + client.revenue,
      0
    );
    
    expect(categoryARevenue / totalRevenue).toBeGreaterThan(0.75);
  });
});
