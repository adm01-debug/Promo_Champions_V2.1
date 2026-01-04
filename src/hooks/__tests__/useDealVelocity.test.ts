import { renderHook } from '@testing-library/react';
import { useDealVelocity } from '../useDealVelocity';

describe('useDealVelocity', () => {
  it('calculates deal velocity', () => {
    const { result } = renderHook(() => useDealVelocity());
    expect(result.current.velocity).toBeDefined();
  });
});
