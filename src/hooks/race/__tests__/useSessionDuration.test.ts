import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionDuration } from '../useSessionDuration';

vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

describe('useSessionDuration', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts not fatigued', () => {
    const { result } = renderHook(() => useSessionDuration({ fatigueThresholdMs: 1000, notify: false }));
    expect(result.current.fatigued).toBe(false);
    expect(result.current.elapsed).toBe(0);
  });

  it('becomes fatigued after threshold', async () => {
    const { result } = renderHook(() => useSessionDuration({ fatigueThresholdMs: 1000, notify: false }));
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(result.current.fatigued).toBe(true);
  });

  it('does not flip back after fatigue is set', () => {
    const { result } = renderHook(() => useSessionDuration({ fatigueThresholdMs: 1000, notify: false }));
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(result.current.fatigued).toBe(true);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(result.current.fatigued).toBe(true);
  });

  it('stays not fatigued before threshold', () => {
    const { result } = renderHook(() => useSessionDuration({ fatigueThresholdMs: 10 * 60 * 1000, notify: false }));
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(result.current.fatigued).toBe(false);
  });
});
