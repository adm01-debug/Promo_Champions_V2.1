import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormDraft } from './useFormDraft';

const KEY = 'test:draft';

function setup(initial: { name: string }, key: string | null = KEY) {
  const restore = vi.fn();
  const hook = renderHook(({ state }) => useFormDraft(key, state, restore), {
    initialProps: { state: initial },
  });
  return { restore, ...hook };
}

describe('useFormDraft', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('restaura rascunho existente uma vez', () => {
    localStorage.setItem(KEY, JSON.stringify({ name: 'salvo' }));
    const { restore } = setup({ name: '' });
    expect(restore).toHaveBeenCalledTimes(1);
    expect(restore).toHaveBeenCalledWith({ name: 'salvo' });
  });

  it('não restaura nem grava com chave nula', () => {
    const { restore } = setup({ name: 'x' }, null);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(restore).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('primeira edição antes do debounce é gravada (baseline da montagem)', () => {
    const { rerender } = setup({ name: '' });
    // Outra aba grava um rascunho enquanto esta está aberta.
    localStorage.setItem(KEY, JSON.stringify({ name: 'outra-aba' }));
    // Usuário edita ANTES do primeiro flush — a edição não pode ser
    // confundida com a baseline e perdida.
    rerender({ state: { name: 'minha-edicao' } });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ name: 'minha-edicao' }));
  });

  it('aba que nunca editou não sobrescreve rascunho de outra aba', () => {
    const { rerender } = setup({ name: '' });
    // Primeira gravação desta aba (baseline no storage vazio).
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ name: '' }));
    // Outra aba grava trabalho real.
    localStorage.setItem(KEY, JSON.stringify({ name: 'trabalho' }));
    // Re-render sem edição — não pode clobar o rascunho da outra aba.
    rerender({ state: { name: '' } });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ name: 'trabalho' }));
  });

  it('grava pendência no pagehide sem esperar o debounce', () => {
    const { rerender } = setup({ name: '' });
    rerender({ state: { name: 'ultima-edicao' } });
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ name: 'ultima-edicao' }));
  });

  it('grava pendência na desmontagem (navegação interna)', () => {
    const { rerender, unmount } = setup({ name: '' });
    rerender({ state: { name: 'saindo' } });
    unmount();
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ name: 'saindo' }));
  });

  it('flush respeita rascunho mais novo de outra aba quando não editou', () => {
    const { rerender, unmount } = setup({ name: '' });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    localStorage.setItem(KEY, JSON.stringify({ name: 'trabalho' }));
    // Re-render sem edição → pendência é a baseline intocada; a outra aba
    // vence no flush da desmontagem.
    rerender({ state: { name: '' } });
    unmount();
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ name: 'trabalho' }));
  });
});
