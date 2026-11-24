import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let invokeResult: { data: unknown; error: unknown } = { data: null, error: null };
let saleRow: Record<string, unknown> | null = null;
let salesRows: Record<string, unknown>[] = [];
let activityCount = 0;

vi.mock('@/integrations/supabase/client', () => {
  const query = (table: string) => {
    const q = {
      select: () => q,
      eq: () => q,
      is: () => q,
      in: () => q,
      single: () => Promise.resolve({ data: saleRow, error: null }),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve(
          table === 'activities'
            ? { count: activityCount, error: null }
            : { data: salesRows, error: null }
        ).then(resolve),
    };
    return q;
  };
  return {
    supabase: {
      functions: { invoke: () => Promise.resolve(invokeResult) },
      from: (table: string) => query(table),
    },
  };
});

vi.mock('@/lib/stageProbabilities', () => ({
  fetchStageProbabilities: () => Promise.resolve({ proposal: 0.6 }),
}));

const { useDealProbability, useDealProbabilities } = await import('./useDealProbability');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const sale = () => ({
  id: 'sale-1',
  status: 'proposal',
  amount: 1500,
  created_at: new Date().toISOString(),
  salesperson_id: 'sp-1',
});

describe('useDealProbability — origem do número (etapa 117)', () => {
  beforeEach(() => {
    invokeResult = { data: null, error: null };
    saleRow = sale();
    salesRows = [sale()];
    activityCount = 0;
  });

  it('marca a análise vinda do servidor como "servidor"', async () => {
    invokeResult = {
      data: {
        probabilities: { 'sale-1': { probability: 73, factors: ['Etapa: proposal'] } },
      },
      error: null,
    };

    const { result } = renderHook(() => useDealProbability('sale-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      probability: 73,
      factors: ['Etapa: proposal'],
      source: 'servidor',
    });
  });

  it('marca a heurística local como "estimativa" quando o servidor não devolve nada', async () => {
    const { result } = renderHook(() => useDealProbability('sale-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.source).toBe('estimativa');
    expect(result.current.data?.probability).toBeGreaterThan(0);
  });

  it('marca como "estimativa" quando a edge function devolve erro', async () => {
    invokeResult = { data: null, error: { message: 'timeout' } };

    const { result } = renderHook(() => useDealProbability('sale-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.source).toBe('estimativa');
  });

  it('o lote também informa a origem de cada número', async () => {
    const { result } = renderHook(() => useDealProbabilities(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.['sale-1']).toEqual({
      probability: 60,
      source: 'estimativa',
    });
  });
});
