import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const from = vi.fn();
const update = vi.fn();
const del = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();
let selectResult: { data: unknown; error: unknown } = { data: [], error: null };
let singleResult: { data: unknown; error: unknown } = { data: null, error: null };

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
      return query;
    },
    single: () => Promise.resolve(singleResult),
    then: (resolve: (value: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve(selectResult).then(resolve),
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

vi.mock('sonner', () => ({
  toast: { success: toastSuccess, error: toastError },
}));

const { useUpdateWorkflow, useDeleteWorkflow } = await import('./useAutomationWorkflows');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useUpdateWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('atualiza o mesmo registro com os campos do construtor', async () => {
    singleResult = {
      data: { id: 'wf-1', name: 'Novo nome', trigger_type: 'manual' },
      error: null,
    };
    const { result } = renderHook(() => useUpdateWorkflow(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: 'wf-1',
        name: 'Novo nome',
        description: null,
        trigger_type: 'manual',
        actions: [{ type: 'create_task', params: { title: 'Ligar' } }],
        conditions: [],
      });
    });

    expect(from).toHaveBeenCalledWith('automation_workflows');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Novo nome',
        description: null,
        trigger_type: 'manual',
        actions: [{ type: 'create_task', params: { title: 'Ligar' } }],
        conditions: [],
      })
    );
    expect(update.mock.calls[0][0]).not.toHaveProperty('id');
    expect(eq).toHaveBeenCalledWith('id', 'wf-1');
    expect(toastSuccess).toHaveBeenCalledWith('Workflow atualizado');
  });

  it('mostra toast de erro quando o banco recusa', async () => {
    singleResult = { data: null, error: new Error('permission denied') };
    const { result } = renderHook(() => useUpdateWorkflow(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'wf-1', name: 'X', trigger_type: 'manual' })
      ).rejects.toThrow('permission denied');
    });

    expect(toastError).toHaveBeenCalledWith('Erro: permission denied');
  });
});

describe('useDeleteWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exclui o workflow pelo id', async () => {
    selectResult = { data: [{ id: 'wf-1' }], error: null };
    const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('wf-1');
    });

    expect(from).toHaveBeenCalledWith('automation_workflows');
    expect(del).toHaveBeenCalledTimes(1);
    expect(eq).toHaveBeenCalledWith('id', 'wf-1');
    expect(toastSuccess).toHaveBeenCalledWith('Workflow excluído');
  });

  it('falha quando nenhuma linha é removida (RLS ou id inexistente)', async () => {
    selectResult = { data: [], error: null };
    const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('wf-x')).rejects.toThrow(
        'Workflow não encontrado ou sem permissão para excluir'
      );
    });

    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
  });
});
