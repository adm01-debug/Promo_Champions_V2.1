import { renderHook } from '@testing-library/react';
import { useClosingTime } from '../useClosingTime';

describe('useClosingTime', () => {
  it('calculates average closing time', () => {
    const { result } = renderHook(() => useClosingTime());
    expect(result.current.averageTime).toBeGreaterThan(0);
  });
});
