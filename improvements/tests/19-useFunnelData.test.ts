// Melhoria 19 - useFunnelData.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFunnelData } from '../useFunnelData';

describe('useFunnelData', () => {
  it('should return funnel stages with counts', async () => {
    const { result } = renderHook(() => useFunnelData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stages).toBeDefined();
    expect(result.current.stages.length).toBeGreaterThan(0);

    result.current.stages.forEach((stage) => {
      expect(stage).toHaveProperty('name');
      expect(stage).toHaveProperty('count');
      expect(stage).toHaveProperty('value');
    });
  });

  it('should calculate conversion rates between stages', async () => {
    const { result } = renderHook(() => useFunnelData());

    await waitFor(() => {
      expect(result.current.conversionRates).toBeDefined();
    });

    expect(result.current.conversionRates[0]).toBeGreaterThan(0);
    expect(result.current.conversionRates[0]).toBeLessThanOrEqual(100);
  });

  it('should identify bottleneck stages', async () => {
    const { result } = renderHook(() => useFunnelData());

    await waitFor(() => {
      expect(result.current.bottleneck).toBeDefined();
    });

    expect(result.current.bottleneck.stage).toBeDefined();
    expect(result.current.bottleneck.dropoff_rate).toBeGreaterThan(20);
  });
});
