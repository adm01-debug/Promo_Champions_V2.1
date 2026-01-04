import { renderHook } from '@testing-library/react';
import { useSalespersonCoaching } from '../useSalespersonCoaching';

describe('useSalespersonCoaching', () => {
  it('provides coaching insights', () => {
    const { result } = renderHook(() => useSalespersonCoaching('user1'));
    expect(result.current.insights).toBeDefined();
  });
});
