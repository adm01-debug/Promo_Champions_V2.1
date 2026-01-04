import { renderHook } from '@testing-library/react';
import { useFunnelData } from '../useFunnelData';

describe('useFunnelData', () => {
  it('returns funnel stages', () => {
    const { result } = renderHook(() => useFunnelData());
    expect(result.current.stages).toBeDefined();
  });
});
