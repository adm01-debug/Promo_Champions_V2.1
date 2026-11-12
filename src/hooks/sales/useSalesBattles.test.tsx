import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const from = vi.fn();
const update = vi.fn();
const del = vi.fn();
const eq = vi.fn();
let mutationResult: { data: { id: string }[] | null; error: Error | null } = {
  data: [{ id: 'batalha-1' }],
  error: null,
};

vi.mock('@/integrations/supabase/client', () => {
  const builder = () => {
    const query = {
      select: () => query,
      in: () => query,
      order: () => query,
      limit: () => Promise.resolve({ data: [], error: null }),
      update: (...args: unknown[]) => {
        update(...args);
        return query;
      },
      delete: () => {
        del();
        return query;
      },
      eq: (...args: unknown[]) => {
        eq(...args);
        return {
          select: () => Promise.resolve(mutationResult),
        };
      },
    };
    return query;
  };

  const channel = { on: () => channel, subscribe: () => channel };

  return {
    supabase: {
      from: (table: string) => {
        from(table);
        return builder();
      },
      channel: () => channel,
      removeChannel: vi.fn(),
    },
  };
});

const { useSalesBattles } = await import('./useSalesBattles');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

const changes = {
  id: 'batalha-1',
  title: 'Operação Março',
  battle_type: 'ffa',
  metric: 'deals',
  ends_at: '2026-12-01T12:00:00.000Z',
  xp_reward: 250,
};

describe('useSalesBattles — editar e cancelar', () => {
  beforeEach(() => {
    from.mockClear();
    update.mockClear();
    del.mockClear();
    eq.mockClear();
    mutationResult = { data: [{ id: 'batalha-1' }], error: null };
  });

  it('atualiza somente os campos da batalha pelo id', async () => {
    const { result } = renderHook(() => useSalesBattles(), { wrapper });

    await act(async () => {
      await result.current.updateBattle.mutateAsync(changes);
    });

    expect(from).toHaveBeenCalledWith('sales_battles');
    expect(update).toHaveBeenCalledWith({
      title: 'Operação Março',
      battle_type: 'ffa',
      metric: 'deals',
      ends_at: '2026-12-01T12:00:00.000Z',
      xp_reward: 250,
    });
    expect(eq).toHaveBeenCalledWith('id', 'batalha-1');
  });

  it('falha quando a RLS não deixa editar (0 linhas)', async () => {
    mutationResult = { data: [], error: null };
    const { result } = renderHook(() => useSalesBattles(), { wrapper });

    await act(async () => {
      await expect(result.current.updateBattle.mutateAsync(changes)).rejects.toThrow(
        'Sem permissão para editar esta batalha'
      );
    });
  });

  it('cancela a batalha pelo id sem apagar a linha', async () => {
    const { result } = renderHook(() => useSalesBattles(), { wrapper });

    await act(async () => {
      await result.current.cancelBattle.mutateAsync('batalha-1');
    });

    expect(update).toHaveBeenCalledWith({ status: 'cancelled' });
    expect(eq).toHaveBeenCalledWith('id', 'batalha-1');
    expect(del).not.toHaveBeenCalled();
  });

  it('falha quando a RLS não deixa cancelar (0 linhas)', async () => {
    mutationResult = { data: [], error: null };
    const { result } = renderHook(() => useSalesBattles(), { wrapper });

    await act(async () => {
      await expect(result.current.cancelBattle.mutateAsync('batalha-1')).rejects.toThrow(
        'Sem permissão para cancelar esta batalha'
      );
    });
  });
});
