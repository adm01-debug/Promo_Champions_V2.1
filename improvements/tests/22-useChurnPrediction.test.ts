// Melhoria 22
import { describe, it, expect } from 'vitest';
import { useChurnPrediction } from '../useChurnPrediction';

describe('useChurnPrediction', () => {
  it('should return churn probability between 0 and 1', () => {
    const { result } = renderHook(() =>
      useChurnPrediction({ clientId: 'client-123' })
    );

    expect(result.current.churnProbability).toBeGreaterThanOrEqual(0);
    expect(result.current.churnProbability).toBeLessThanOrEqual(1);
  });

  it('should identify high-risk clients', () => {
    const { result } = renderHook(() => useChurnPrediction());

    const highRisk = result.current.highRiskClients;
    highRisk.forEach((client) => {
      expect(client.churnProbability).toBeGreaterThan(0.7);
    });
  });
});
