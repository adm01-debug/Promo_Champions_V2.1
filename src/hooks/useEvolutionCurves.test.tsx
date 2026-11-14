import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { describe, expect, it, vi } from 'vitest';

// Dois vendedores ativos com o mesmo nome: a curva não pode misturar as receitas.
const salespeopleRows = [
  { id: 'sp-1', name: 'João' },
  { id: 'sp-2', name: 'João' },
];
const salesRows = [
  {
    salesperson_id: 'sp-1',
    amount: 100,
    status: 'won',
    created_at: new Date().toISOString(),
  },
  {
    salesperson_id: 'sp-2',
    amount: 50,
    status: 'won',
    created_at: new Date().toISOString(),
  },
];

vi.mock('@/integrations/supabase/client', () => {
  const builder = (data: unknown[]) => {
    const query = {
      select: () => query,
      eq: () => query,
      gte: () => query,
      in: () => query,
      then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve),
    };
    return query;
  };

  return {
    supabase: {
      from: (table: string) =>
        builder(table === 'salespeople' ? salespeopleRows : salesRows),
    },
  };
});

const { useEvolutionCurves } = await import('./useEvolutionCurves');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useEvolutionCurves', () => {
  it('indexa a receita acumulada pelo id, sem somar vendedores homônimos', async () => {
    const { result } = renderHook(() => useEvolutionCurves(7), { wrapper });

    await waitFor(() => expect(result.current.chartData.length).toBeGreaterThan(0));

    const { chartData } = result.current;
    const last = chartData[chartData.length - 1];
    expect(last?.['sp-1']).toBe(100);
    expect(last?.['sp-2']).toBe(50);
    expect(last).not.toHaveProperty('João');
  });

  it('filtra pelos ids selecionados', async () => {
    const { result } = renderHook(() => useEvolutionCurves(7, ['sp-2']), { wrapper });

    await waitFor(() => expect(result.current.chartData.length).toBeGreaterThan(0));

    const { chartData } = result.current;
    const last = chartData[chartData.length - 1];
    expect(last?.['sp-2']).toBe(50);
    expect(last).not.toHaveProperty('sp-1');
  });
});
