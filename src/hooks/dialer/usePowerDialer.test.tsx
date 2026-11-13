import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const from = vi.fn();
const update = vi.fn();
const del = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const toast = vi.fn();

let result: { data: { id: string }[] | null; error: Error | null } = {
  data: [{ id: 'fila-1' }],
  error: null,
};

vi.mock('@/integrations/supabase/client', () => {
  const query = {
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
      return query;
    },
    select: (...args: unknown[]) => {
      select(...args);
      return Promise.resolve(result);
    },
  };
  return {
    supabase: {
      from: (table: string) => {
        from(table);
        return query;
      },
    },
  };
});

vi.mock('@/hooks/use-toast', () => ({ toast }));

const { useUpdateQueue, useDeleteQueue } = await import('./usePowerDialer');

let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client }, children);
}

describe('usePowerDialer — editar e excluir fila', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    result = { data: [{ id: 'fila-1' }], error: null };
  });

  it('atualiza nome, estratégia e filtro da fila e invalida a lista', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result: hook } = renderHook(() => useUpdateQueue(), { wrapper });

    await act(async () => {
      await hook.current.mutateAsync({
        id: 'fila-1',
        name: 'Hot leads',
        priority_strategy: 'score',
        filter: { min_score: 50 },
      });
    });

    expect(from).toHaveBeenCalledWith('dialer_queues');
    expect(update).toHaveBeenCalledWith({
      name: 'Hot leads',
      priority_strategy: 'score',
      filter: { min_score: 50 },
    });
    expect(eq).toHaveBeenCalledWith('id', 'fila-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['dialer-queues'] });
    expect(toast).toHaveBeenCalledWith({ title: 'Fila atualizada' });
  });

  it('acusa erro quando o RLS não deixa alterar a fila (0 linhas)', async () => {
    result = { data: [], error: null };
    const { result: hook } = renderHook(() => useUpdateQueue(), { wrapper });

    await act(async () => {
      await expect(
        hook.current.mutateAsync({
          id: 'fila-1',
          name: 'X',
          priority_strategy: 'hybrid',
          filter: {},
        })
      ).rejects.toThrow(/sem permissão/);
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao atualizar fila', variant: 'destructive' })
    );
  });

  it('exclui a fila e invalida a lista', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result: hook } = renderHook(() => useDeleteQueue(), { wrapper });

    await act(async () => {
      await hook.current.mutateAsync('fila-1');
    });

    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'fila-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['dialer-queues'] });
    expect(toast).toHaveBeenCalledWith({ title: 'Fila excluída' });
  });

  it('mostra erro ao excluir quando o banco retorna falha', async () => {
    result = { data: null, error: new Error('falha de rede') };
    const { result: hook } = renderHook(() => useDeleteQueue(), { wrapper });

    await act(async () => {
      await expect(hook.current.mutateAsync('fila-1')).rejects.toThrow('falha de rede');
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao excluir fila',
        description: 'falha de rede',
        variant: 'destructive',
      })
    );
  });
});
