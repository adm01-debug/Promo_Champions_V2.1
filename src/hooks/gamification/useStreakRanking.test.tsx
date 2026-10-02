import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createElement } from 'react';

// Rastreia chamadas `.in(coluna, valores)` — prova que a busca de conquistas
// virou UMA query agregada por vendedor (sem N+1).
const inCalls: Array<{ column: string; values: unknown[] }> = [];

vi.mock('@/integrations/supabase/client', () => {
  const makeBuilder = (rows: unknown[]) => {
    const thenable = {
      data: rows,
      error: null as null | { message: string },
      select: () => thenable,
      eq: () => thenable,
      neq: () => thenable,
      not: () => thenable,
      order: () => thenable,
      limit: () => thenable,
      // fetchAllRows chama .range(from, to); devolve todas as linhas do mock
      // (sempre < pageSize, então a paginação termina na primeira página).
      range: () => thenable,
      in: (column: string, values: unknown[]) => {
        inCalls.push({ column, values });
        return thenable;
      },
      then: (
        resolve: (v: { data: unknown[]; error: { message: string } | null }) => unknown
      ) => Promise.resolve({ data: thenable.data, error: thenable.error }).then(resolve),
    };
    return thenable;
  };

  return {
    supabase: {
      from: (table: string) => {
        if (table === 'salespeople') {
          return makeBuilder([
            { id: 'sp1', name: 'Ana', avatar_url: null, role: 'closer' },
            { id: 'sp2', name: 'Beto', avatar_url: null, role: 'sdr' },
            { id: 'sp3', name: 'Carla', avatar_url: null, role: 'closer' },
          ]);
        }
        if (table === 'achievements') {
          return makeBuilder([
            {
              salesperson_id: 'sp1',
              achievement_date: '2026-09-30',
              achievement_type: 'daily_goal',
            },
            {
              salesperson_id: 'sp1',
              achievement_date: '2026-09-29',
              achievement_type: 'daily_goal',
            },
            {
              salesperson_id: 'sp2',
              achievement_date: '2026-09-30',
              achievement_type: 'daily_goal',
            },
          ]);
        }
        return makeBuilder([]);
      },
    },
  };
});

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

// Import DEPOIS do mock registrado.
const { useStreakRanking } = await import('./useAchievements');

describe('useStreakRanking — agregação sem N+1', () => {
  beforeEach(() => {
    inCalls.length = 0;
  });

  it('busca conquistas de todos os vendedores em uma única query .in()', async () => {
    const { result } = renderHook(() => useStreakRanking(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const salespersonCalls = inCalls.filter(c => c.column === 'salesperson_id');
    expect(salespersonCalls).toHaveLength(1);
    expect(salespersonCalls[0]?.values).toEqual(['sp1', 'sp2', 'sp3']);
  });

  it('monta ranking correto com múltiplos vendedores e conquistas', async () => {
    const { result } = renderHook(() => useStreakRanking(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const rows = result.current.data!;
    expect(rows).toHaveLength(3);

    const ana = rows.find(r => r.salesperson_id === 'sp1')!;
    expect(ana.totalGoalsAchieved).toBe(2);
    expect(ana.best_streak).toBe(2);
    expect(ana.current_streak).toBe(1);

    const beto = rows.find(r => r.salesperson_id === 'sp2')!;
    expect(beto.totalGoalsAchieved).toBe(1);
    expect(beto.current_streak).toBe(1);

    const carla = rows.find(r => r.salesperson_id === 'sp3')!;
    expect(carla.totalGoalsAchieved).toBe(0);
    expect(carla.current_streak).toBe(0);
    expect(carla.rank).toBe(3); // sem conquistas fica por último
  });
});
