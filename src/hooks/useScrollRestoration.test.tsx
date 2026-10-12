import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter, useNavigate, type NavigateFunction } from 'react-router-dom';
import { useScrollRestoration } from './useScrollRestoration';

function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
}

let nav: NavigateFunction;
function Probe() {
  useScrollRestoration();
  nav = useNavigate();
  return null;
}

const scrollCalls = () =>
  (window.scrollTo as ReturnType<typeof vi.fn>).mock.calls.map(
    c => c[0] as { top: number }
  );

describe('useScrollRestoration', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.scrollTo = vi.fn();
    setScrollY(0);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    setScrollY(0);
  });

  it('vai ao topo em navegação PUSH', async () => {
    render(
      <MemoryRouter initialEntries={['/lista']}>
        <Probe />
      </MemoryRouter>
    );
    (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();
    await act(async () => {
      nav('/detalhe/1');
    });
    expect(scrollCalls()).toContainEqual({ top: 0, behavior: 'instant' });
  });

  it('restaura posição salva ao voltar (POP)', async () => {
    render(
      <MemoryRouter initialEntries={['/lista']}>
        <Probe />
      </MemoryRouter>
    );
    // Simula usuário que scrollou 420px na lista.
    setScrollY(420);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    await act(async () => {
      nav('/detalhe/1');
    });
    (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();
    setScrollY(0);
    await act(async () => {
      nav(-1);
    });
    expect(scrollCalls().some(c => c.top === 420)).toBe(true);
  });

  it('retentativas reaplicam a posição quando não há scroll externo', async () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={['/lista']}>
        <Probe />
      </MemoryRouter>
    );
    setScrollY(420);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    await act(async () => {
      nav('/detalhe/1');
    });
    (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();
    setScrollY(0);
    await act(async () => {
      nav(-1);
    });
    const callsAfterRestore = scrollCalls().length;
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(scrollCalls().length).toBeGreaterThan(callsAfterRestore);
    vi.useRealTimers();
  });

  it('cancela retentativas quando o usuário move o scroll (desvio > 8px)', async () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={['/lista']}>
        <Probe />
      </MemoryRouter>
    );
    setScrollY(420);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    await act(async () => {
      nav('/detalhe/1');
    });
    (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();
    setScrollY(0);
    await act(async () => {
      nav(-1);
    });
    const callsAfterRestore = scrollCalls().length;
    // Arraste de scrollbar ~20px: gesto sem wheel/keydown, acima do
    // limiar de 8px e abaixo do antigo de 40px — deve parar as retentativas.
    setScrollY(20);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(scrollCalls().length).toBe(callsAfterRestore);
    vi.useRealTimers();
  });

  it('vai ao topo no POP quando não há posição salva', async () => {
    render(
      <MemoryRouter initialEntries={['/a', '/b']} initialIndex={1}>
        <Probe />
      </MemoryRouter>
    );
    (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();
    await act(async () => {
      nav(-1);
    });
    expect(scrollCalls()).toContainEqual({ top: 0, behavior: 'instant' });
  });
});
