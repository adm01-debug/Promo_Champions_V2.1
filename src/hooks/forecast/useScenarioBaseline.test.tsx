import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createElement } from 'react';

// Registra os filtros aplicados na query de `sales` para provar que a base
// vem de vendas reais ganhas/perdidas, não excluídas.
const calls: Array<{ method: string; args: unknown[] }> = [];
let mockRows: unknown[] = [];

vi.mock('@/integrations/supabase/client', () => {
  const makeBuilder = () => {
    const record =
      (method: string) =>
      (...args: unknown[]) => {
        calls.push({ method, args });
        return builder;
      };
    const builder = {
      select: record('select'),
      in: record('in'),
      is: record('is'),
      or: record('or'),
      order: record('order'),
      range: record('range'),
      then: (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data: mockRows, error: null }).then(resolve),
    };
    return builder;
  };
  return {
    supabase: {
      from: (table: string) => {
        calls.push({ method: 'from', args: [table] });
        return makeBuilder();
      },
    },
  };
});

const { computeScenarioBaseline, useScenarioBaseline } =
  await import('./useScenarioBaseline');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const start = new Date('2026-08-14T00:00:00Z');

describe('computeScenarioBaseline', () => {
  it('soma só vendas ganhas na janela e calcula win-rate e receita por vendedor', () => {
    const result = computeScenarioBaseline(
      [
        {
          amount: '1000.50',
          status: 'won',
          salesperson_id: 'sp1',
          created_at: '2026-06-01T00:00:00Z',
          closed_at: '2026-09-01T00:00:00Z',
        },
        {
          amount: 2000,
          status: 'completed',
          salesperson_id: 'sp2',
          created_at: '2026-09-10T00:00:00Z',
          closed_at: null,
        },
        {
          amount: 999,
          status: 'closed',
          salesperson_id: 'sp1',
          created_at: '2026-09-10T00:00:00Z',
          closed_at: '2026-08-01T00:00:00Z', // fechada antes da janela
        },
        {
          amount: 500,
          status: 'lost',
          salesperson_id: 'sp3',
          created_at: '2026-09-15T00:00:00Z',
          closed_at: null,
        },
        {
          amount: 700,
          status: 'proposal',
          salesperson_id: 'sp3',
          created_at: '2026-09-15T00:00:00Z',
          closed_at: null,
        },
      ],
      start
    );

    expect(result.wonRevenue).toBeCloseTo(3000.5);
    expect(result.wonCount).toBe(2);
    expect(result.lostCount).toBe(1);
    expect(result.winRate).toBeCloseTo((2 / 3) * 100);
    expect(result.sellersWithWins).toBe(2);
    expect(result.revenuePerSeller).toBeCloseTo(1500.25);
  });

  it('sem vendas fechadas devolve base zerada e métricas nulas (sem número inventado)', () => {
    const result = computeScenarioBaseline([], start);
    expect(result).toEqual({
      wonRevenue: 0,
      wonCount: 0,
      lostCount: 0,
      winRate: null,
      sellersWithWins: 0,
      revenuePerSeller: null,
    });
  });
});

describe('useScenarioBaseline', () => {
  beforeEach(() => {
    calls.length = 0;
    mockRows = [];
  });

  it('consulta sales ganhas/perdidas não excluídas e agrega o resultado', async () => {
    mockRows = [
      {
        amount: 4000,
        status: 'won',
        salesperson_id: 'sp1',
        created_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
      },
    ];

    const { result } = renderHook(() => useScenarioBaseline(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.wonRevenue).toBe(4000);
    expect(result.current.data?.sellersWithWins).toBe(1);
    expect(calls).toContainEqual({ method: 'from', args: ['sales'] });
    expect(calls).toContainEqual({ method: 'is', args: ['deleted_at', null] });
    const inCall = calls.find(c => c.method === 'in');
    expect(inCall?.args[0]).toBe('status');
    expect(inCall?.args[1]).toEqual(
      expect.arrayContaining(['won', 'completed', 'closed', 'lost', 'cancelled'])
    );
  });
});
