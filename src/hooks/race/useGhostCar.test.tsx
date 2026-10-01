import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createElement } from 'react';

// Rastreia chamadas `.in(coluna, valores)` — prova que o histórico de seasons
// virou UMA query agregada (sem N+1: era uma query por season).
const inCalls: Array<{ column: string; values: unknown[] }> = [];

const SEASONS = [
  {
    id: 'season-1',
    name: 'Season 1',
    start_date: '2026-01-01',
    end_date: '2026-02-01',
    status: 'finished',
  },
  {
    id: 'season-2',
    name: 'Season 2',
    start_date: '2026-03-01',
    end_date: '2026-04-01',
    status: 'finished',
  },
  {
    id: 'season-3',
    name: 'Season 3',
    start_date: '2026-05-01',
    end_date: '2026-06-01',
    status: 'finished',
  },
];

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
        if (table === 'race_seasons') return makeBuilder(SEASONS);
        if (table === 'race_leaderboard_view') {
          // Usuário tem progresso em 2 das 3 seasons
          return makeBuilder([
            { season_id: 'season-1', salesperson_id: 'sp-me', progress: 0.4 },
            { season_id: 'season-3', salesperson_id: 'sp-me', progress: 0.9 },
            { season_id: 'season-2', salesperson_id: 'outro', progress: 0.7 },
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
const { useGhostCar } = await import('./useGhostCar');

const now = Date.now();
const currentSeason = {
  id: 'season-atual',
  name: 'Atual',
  start_date: new Date(now - 86_400_000).toISOString(),
  end_date: new Date(now + 86_400_000).toISOString(),
  status: 'active',
  role_type: 'closer',
  winner_id: null,
};

describe('useGhostCar — histórico sem N+1', () => {
  beforeEach(() => {
    inCalls.length = 0;
  });

  it('busca progresso de todas as seasons em uma única query .in()', async () => {
    const { result } = renderHook(
      () =>
        useGhostCar({
          mySalespersonId: 'sp-me',
          currentSeason,
          leaderboard: [{ salesperson_id: 'sp-me', progress: 0.1 } as never],
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.status).not.toBe('no-data'));

    const seasonCalls = inCalls.filter(c => c.column === 'season_id');
    expect(seasonCalls).toHaveLength(1);
    expect(seasonCalls[0].values).toEqual(['season-1', 'season-2', 'season-3']);
  });

  it('usa a melhor season do usuário como referência do ghost', async () => {
    const { result } = renderHook(
      () =>
        useGhostCar({
          mySalespersonId: 'sp-me',
          currentSeason,
          leaderboard: [{ salesperson_id: 'sp-me', progress: 0.1 } as never],
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.bestSeasonName).toBe('Season 3'));
    // progresso final 0.9 projetado a ~50% do tempo decorrido → atrás do ghost
    expect(result.current.status).toBe('behind');
  });
});
