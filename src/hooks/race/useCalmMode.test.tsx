import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCalmMode } from './useCalmMode';

const STORAGE_KEY = 'race_calm_mode';
const EVENT = 'race-calm-mode-change';

describe('useCalmMode', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('lê a preferência salva na montagem', () => {
    window.localStorage.setItem(STORAGE_KEY, '1');

    const { result } = renderHook(() => useCalmMode());

    expect(result.current.calm).toBe(true);
  });

  it('assume desligado quando não há preferência ou o valor é inválido', () => {
    window.localStorage.setItem(STORAGE_KEY, 'talvez');

    const { result } = renderHook(() => useCalmMode());

    expect(result.current.calm).toBe(false);
  });

  it('alterna, grava e sincroniza as outras instâncias pela mesma fonte', () => {
    const first = renderHook(() => useCalmMode());
    const second = renderHook(() => useCalmMode());

    expect(second.result.current.calm).toBe(false);

    act(() => first.result.current.toggle());

    expect(first.result.current.calm).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(second.result.current.calm).toBe(true);
  });

  it('setCalmMode grava o valor pedido', () => {
    const { result } = renderHook(() => useCalmMode());

    act(() => result.current.setCalmMode(true));

    expect(result.current.calm).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
  });

  it('não assina nada quando desabilitado (evita instância duplicada)', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');

    renderHook(() => useCalmMode(false));

    const subscriptions = addEventListener.mock.calls.filter(([type]) => type === EVENT);
    expect(subscriptions).toHaveLength(0);

    addEventListener.mockRestore();
  });

  it('assina uma vez quando habilitado', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');

    renderHook(() => useCalmMode());

    const subscriptions = addEventListener.mock.calls.filter(([type]) => type === EVENT);
    expect(subscriptions).toHaveLength(1);

    addEventListener.mockRestore();
  });
});
