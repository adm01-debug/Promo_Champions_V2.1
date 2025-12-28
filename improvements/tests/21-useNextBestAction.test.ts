// Melhoria 21
import { describe, it, expect } from 'vitest';
import { useNextBestAction } from '../useNextBestAction';

describe('useNextBestAction', () => {
  it('should suggest actions based on deal stage', () => {
    const { result } = renderHook(() =>
      useNextBestAction({ dealId: 'deal-123' })
    );

    expect(result.current.action).toBeDefined();
    expect(result.current.action.type).toMatch(/call|email|meeting/);
    expect(result.current.action.priority).toMatch(/urgent|high|medium|low/);
  });
});
