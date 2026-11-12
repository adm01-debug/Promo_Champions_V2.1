import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let salesRows: Array<{
  amount: number | null;
  product_name: string | null;
  client_name: string | null;
  status: string;
}> = [];

vi.mock('@/integrations/supabase/client', () => {
  const query = {
    select: () => query,
    in: () => query,
    then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
      Promise.resolve({ data: salesRows, error: null }).then(resolve),
  };
  return { supabase: { from: () => query } };
});

const { useABCAnalysis } = await import('./useABCAnalysis');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useABCAnalysis', () => {
  beforeEach(() => {
    salesRows = [];
  });

  it('calcula a concentração dos maiores clientes a partir das vendas reais', async () => {
    salesRows = [
      { amount: 500, product_name: 'Caneca', client_name: 'Cliente 1', status: 'won' },
      { amount: 300, product_name: 'Caneta', client_name: 'Cliente 2', status: 'won' },
      { amount: 100, product_name: 'Caneta', client_name: 'Cliente 3', status: 'won' },
      { amount: 100, product_name: 'Boné', client_name: 'Cliente 4', status: 'won' },
    ];

    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.totalRevenue).toBe(1000);
    expect(result.current.data?.neuralInsights).toEqual([
      {
        title: 'Concentração de Receita',
        description: 'Seus 3 principais clientes geram 90.0% da receita.',
        type: 'warning',
      },
    ]);
  });

  it('não devolve insights, movimentações nem automações fictícias', async () => {
    salesRows = [
      { amount: 200, product_name: 'Caneca', client_name: 'Cliente 1', status: 'won' },
    ];

    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const keys = Object.keys(result.current.data ?? {});
    expect(keys).not.toContain('matrixShifts');
    expect(keys).not.toContain('automations');
    expect(result.current.data?.neuralInsights.map(i => i.description)).toEqual([
      'Seu principal cliente gera 100.0% da receita.',
    ]);
  });

  it('sem vendas, não gera nenhum insight', async () => {
    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.clients).toEqual([]);
    expect(result.current.data?.neuralInsights).toEqual([]);
  });
});
