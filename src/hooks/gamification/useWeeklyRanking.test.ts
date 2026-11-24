import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const is = vi.fn();
  const lte = vi.fn();
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.is = vi.fn((...args: unknown[]) => {
    is(...args);
    return chain;
  });
  chain.in = vi.fn(() => chain);
  chain.gte = vi.fn(() => chain);
  chain.lte = vi.fn((...args: unknown[]) => {
    lte(...args);
    return { data: [], error: null };
  });
  const from = vi.fn(() => chain);
  const rpc = vi.fn(() => Promise.resolve({ data: [], error: null }));
  return { chain, is, lte, from, rpc };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mocks.from, rpc: mocks.rpc },
}));

import { useWeeklyRanking } from './useWeeklyRanking';

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    {
      client: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    },
    children
  );

// QA-069: venda excluída logicamente não pode continuar no ranking.
describe('useWeeklyRanking (QA-069)', () => {
  beforeEach(() => {
    mocks.is.mockClear();
    mocks.lte.mockClear();
    mocks.from.mockClear();
  });

  it('consulta sales com deleted_at nulo', async () => {
    const { result } = renderHook(() => useWeeklyRanking(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mocks.from).toHaveBeenCalledWith('sales');
    expect(mocks.is).toHaveBeenCalledWith('deleted_at', null);
  });

  it('mantem o recorte de status ganho e de janela da semana', async () => {
    const { result } = renderHook(() => useWeeklyRanking(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mocks.lte).toHaveBeenCalledTimes(1);
    const chain = mocks.chain as Record<string, ReturnType<typeof vi.fn>>;
    expect(chain.in).toHaveBeenCalledWith('status', expect.any(Array));
    expect(chain.gte).toHaveBeenCalledWith('created_at', expect.any(String));
  });
});
