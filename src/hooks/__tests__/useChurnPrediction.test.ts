import { renderHook } from '@testing-library/react';
import { useChurnPrediction } from '../useChurnPrediction';

describe('useChurnPrediction', () => {
  it('predicts churn risk', () => {
    const { result } = renderHook(() => useChurnPrediction());
    expect(result.current.riskScore).toBeGreaterThanOrEqual(0);
  });
});
