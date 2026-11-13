import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createElement } from 'react';

type Resp = { data: unknown; error: { message: string; code?: string } | null };

const respostas: Record<string, Resp> = {};
const inserts: Array<{ table: string; row: unknown }> = [];
const orders: Array<{ table: string; column: string; opts: unknown }> = [];

vi.mock('@/integrations/supabase/client', () => {
  const makeBuilder = (table: string) => {
    const resp = () => respostas[table] ?? { data: [], error: null };
    const b = {
      select: () => b,
      eq: () => b,
      limit: () => b,
      order: (column: string, opts: unknown) => {
        orders.push({ table, column, opts });
        return b;
      },
      maybeSingle: () => Promise.resolve(resp()),
      insert: (row: unknown) => {
        inserts.push({ table, row });
        return Promise.resolve(resp());
      },
      then: (resolve: (v: Resp) => unknown) => Promise.resolve(resp()).then(resolve),
    };
    return b;
  };
  return {
    supabase: {
      from: (table: string) => makeBuilder(table),
      auth: { getUser: () => Promise.resolve({ data: { user: { id: 'auth-1' } } }) },
    },
  };
});

const { useLeagues, useLeagueEnrollment, useJoinLeague } = await import('./useLeagues');

let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client }, children);
}

describe('useLeagues', () => {
  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    for (const k of Object.keys(respostas)) delete respostas[k];
    inserts.length = 0;
    orders.length = 0;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('falha (isError) quando league_members não pode ser lido, em vez de lista vazia', async () => {
    respostas.salespeople = {
      data: [{ id: 'sp1', name: 'Ana', avatar_url: null }],
      error: null,
    };
    respostas.league_members = { data: null, error: { message: 'permission denied' } };

    const { result } = renderHook(() => useLeagues(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it('marca league_id e pontos de quem tem inscrição', async () => {
    respostas.salespeople = {
      data: [
        { id: 'sp1', name: 'Ana', avatar_url: null },
        { id: 'sp2', name: 'Beto', avatar_url: null },
      ],
      error: null,
    };
    respostas.league_members = {
      data: [
        {
          id: 'm1',
          salesperson_id: 'sp1',
          league_id: 'l2',
          weekly_xp: 40,
          leagues: { tier: 2 },
        },
      ],
      error: null,
    };

    const { result } = renderHook(() => useLeagues(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]).toMatchObject({
      salesperson_id: 'sp1',
      league_id: 'l2',
      league: 'silver',
      points: 40,
    });
    expect(result.current.data?.[1]).toMatchObject({
      salesperson_id: 'sp2',
      league_id: null,
    });
  });
});

describe('useLeagueEnrollment', () => {
  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    for (const k of Object.keys(respostas)) delete respostas[k];
    orders.length = 0;
  });

  it('retorna o vendedor logado e a liga de menor tier', async () => {
    respostas.salespeople = { data: { id: 'sp-me' }, error: null };
    respostas.leagues = { data: { id: 'liga-bronze' }, error: null };

    const { result } = renderHook(() => useLeagueEnrollment(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      salespersonId: 'sp-me',
      starterLeagueId: 'liga-bronze',
    });
    expect(orders).toContainEqual({
      table: 'leagues',
      column: 'tier',
      opts: { ascending: true },
    });
  });

  it('starterLeagueId null quando não há liga cadastrada', async () => {
    respostas.salespeople = { data: { id: 'sp-me' }, error: null };
    respostas.leagues = { data: null, error: null };

    const { result } = renderHook(() => useLeagueEnrollment(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.starterLeagueId).toBeNull();
  });
});

describe('useJoinLeague', () => {
  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    for (const k of Object.keys(respostas)) delete respostas[k];
    inserts.length = 0;
  });

  it('insere a inscrição do vendedor e invalida o ranking de ligas', async () => {
    respostas.league_members = { data: null, error: null };
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useJoinLeague(), { wrapper });
    await act(() =>
      result.current.mutateAsync({ salespersonId: 'sp-me', leagueId: 'l1' })
    );

    expect(inserts).toEqual([
      {
        table: 'league_members',
        row: { salesperson_id: 'sp-me', league_id: 'l1', weekly_xp: 0 },
      },
    ]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['salesperson-leagues'] });
  });

  it('traduz violação de unicidade em mensagem legível', async () => {
    respostas.league_members = {
      data: null,
      error: { message: 'duplicate key', code: '23505' },
    };
    const { result } = renderHook(() => useJoinLeague(), { wrapper });
    await expect(
      act(() => result.current.mutateAsync({ salespersonId: 'sp-me', leagueId: 'l1' }))
    ).rejects.toThrow('Você já participa de uma liga.');
  });
});
