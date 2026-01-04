import { renderHook } from '@testing-library/react';
import { useNextBestAction } from '../useNextBestAction';

describe('useNextBestAction', () => {
  it('suggests next action', () => {
    const { result } = renderHook(() => useNextBestAction('deal1'));
    expect(result.current.suggestion).toBeDefined();
  });
});
