import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Resp = { data: unknown; error: { message: string } | null };
const responses: Record<string, Resp> = {};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      const query = {
        select: () => query,
        not: () => query,
        order: () => query,
        then: (resolve: (value: Resp) => unknown, reject?: (e: unknown) => unknown) =>
          Promise.resolve(responses[table] ?? { data: [], error: null }).then(
            resolve,
            reject
          ),
      };
      return query;
    },
  },
}));

const { useInactiveDeals } = await import('./useInactiveDeals');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const oldSale = {
  id: 'sale-1',
  client_name: 'Cliente Antigo',
  status: 'lead',
  updated_at: '2020-01-01T00:00:00Z',
  created_at: '2020-01-01T00:00:00Z',
};

describe('useInactiveDeals', () => {
  beforeEach(() => {
    for (const k of Object.keys(responses)) delete responses[k];
  });

  it('começa em loading e termina com os deals inativos reais', async () => {
    responses.sales = { data: [oldSale], error: null };
    const { result } = renderHook(() => useInactiveDeals(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.inactiveDeals.map(d => d.id)).toEqual(['sale-1']);
    expect(result.current.summary.total).toBe(1);
  });

  it('sinaliza erro quando a consulta de vendas falha', async () => {
    responses.sales = { data: null, error: { message: 'permission denied' } };
    const { result } = renderHook(() => useInactiveDeals(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.inactiveDeals).toEqual([]);
  });

  it('sinaliza erro quando a consulta de atividades falha', async () => {
    responses.sales = { data: [oldSale], error: null };
    responses.activities = { data: null, error: { message: 'timeout' } };
    const { result } = renderHook(() => useInactiveDeals(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
