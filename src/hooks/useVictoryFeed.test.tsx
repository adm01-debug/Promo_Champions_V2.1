import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  result: { data: [] as unknown[] | null, error: null as Error | null },
}));

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => {
  const query: Record<string, unknown> = {};
  Object.assign(query, {
    select: () => query,
    order: () => query,
    limit: () => query,
    update: (...args: unknown[]) => {
      mocks.update(...args);
      return query;
    },
    delete: (...args: unknown[]) => {
      mocks.delete(...args);
      return query;
    },
    eq: (...args: unknown[]) => {
      mocks.eq(...args);
      return query;
    },
    then: (resolve: (value: typeof mocks.result) => unknown) =>
      Promise.resolve(mocks.result).then(resolve),
  });
  const channel = { on: () => channel, subscribe: () => channel };
  return {
    supabase: {
      from: (table: string) => {
        mocks.from(table);
        return query;
      },
      channel: () => channel,
      removeChannel: vi.fn(),
    },
  };
});

vi.mock('sonner', () => ({ toast }));

const { useVictoryFeed } = await import('./useVictoryFeed');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useVictoryFeed — comentários próprios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.result = { data: [{ id: 'c-1' }], error: null };
  });

  it('edita o conteúdo do comentário pelo id', async () => {
    const { result } = renderHook(() => useVictoryFeed(), { wrapper });

    await act(async () => {
      await result.current.updateComment.mutateAsync({
        commentId: 'c-1',
        content: 'Parabéns!',
      });
    });

    expect(mocks.from).toHaveBeenCalledWith('feed_comments');
    expect(mocks.update).toHaveBeenCalledWith({ content: 'Parabéns!' });
    expect(mocks.eq).toHaveBeenCalledWith('id', 'c-1');
    expect(toast.success).toHaveBeenCalledWith('Comentário atualizado');
  });

  it('exclui o comentário pelo id', async () => {
    const { result } = renderHook(() => useVictoryFeed(), { wrapper });

    await act(async () => {
      await result.current.deleteComment.mutateAsync('c-1');
    });

    expect(mocks.delete).toHaveBeenCalled();
    expect(mocks.eq).toHaveBeenCalledWith('id', 'c-1');
    expect(toast.success).toHaveBeenCalledWith('Comentário excluído');
  });

  it('falha com toast de erro quando o RLS não afeta nenhuma linha', async () => {
    mocks.result = { data: [], error: null };
    const { result } = renderHook(() => useVictoryFeed(), { wrapper });

    await act(async () => {
      await expect(result.current.deleteComment.mutateAsync('c-2')).rejects.toThrow(
        'Sem permissão para excluir este comentário'
      );
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Erro ao excluir comentário: Sem permissão para excluir este comentário'
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});
