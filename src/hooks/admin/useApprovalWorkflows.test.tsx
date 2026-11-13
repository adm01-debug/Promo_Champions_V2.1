import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: Array<{ table: string; op: string; payload?: unknown }> = [];
let linkedCount = 0;
let affectedRows: Array<{ id: string }> = [{ id: 'wf-1' }];

const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('sonner', () => ({ toast: { error: toastError, success: toastSuccess } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u-1' } }) }));

vi.mock('@/integrations/supabase/client', () => {
  const builder = (table: string) => {
    let result: { data: unknown; error: null; count?: number } = {
      data: null,
      error: null,
    };
    const query = {
      select: (_cols?: string, opts?: { head?: boolean }) => {
        if (opts?.head) result = { data: null, error: null, count: linkedCount };
        else if (result.data === null) result = { data: affectedRows, error: null };
        return query;
      },
      update: (patch: unknown) => {
        calls.push({ table, op: 'update', payload: patch });
        result = { data: affectedRows, error: null };
        return query;
      },
      delete: () => {
        calls.push({ table, op: 'delete' });
        result = { data: affectedRows, error: null };
        return query;
      },
      eq: () => query,
      then: (resolve: (value: typeof result) => unknown) =>
        Promise.resolve(result).then(resolve),
    };
    return query;
  };
  return { supabase: { from: (table: string) => builder(table) } };
});

const {
  useDeleteWorkflow,
  useToggleWorkflowActive,
  useUpdateWorkflow,
  WorkflowInUseError,
} = await import('./useApprovalWorkflows');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('CRUD de workflows de aprovação', () => {
  beforeEach(() => {
    calls.length = 0;
    linkedCount = 0;
    affectedRows = [{ id: 'wf-1' }];
    toastError.mockReset();
    toastSuccess.mockReset();
  });

  it('atualiza os campos editáveis do workflow', async () => {
    const { result } = renderHook(() => useUpdateWorkflow(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        id: 'wf-1',
        name: 'Desconto 20%',
        workflow_type: 'discount',
        threshold_amount: 1000,
        required_approvers: 2,
        description: null,
      });
    });
    expect(calls).toEqual([
      {
        table: 'approval_workflows',
        op: 'update',
        payload: {
          name: 'Desconto 20%',
          workflow_type: 'discount',
          threshold_amount: 1000,
          required_approvers: 2,
          description: null,
        },
      },
    ]);
    expect(toastSuccess).toHaveBeenCalledWith('Workflow atualizado!');
  });

  it('ativa/desativa via is_active e falha quando RLS não altera nenhuma linha', async () => {
    const { result } = renderHook(() => useToggleWorkflowActive(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 'wf-1', is_active: false });
    });
    expect(calls[0]).toMatchObject({ op: 'update', payload: { is_active: false } });

    affectedRows = [];
    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'wf-1', is_active: true })
      ).rejects.toThrow('Sem permissão');
    });
    expect(toastError).toHaveBeenCalledWith('Erro ao alterar status do workflow');
  });

  it('exclui workflow sem solicitações vinculadas', async () => {
    const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('wf-1');
    });
    expect(calls).toEqual([{ table: 'approval_workflows', op: 'delete' }]);
    expect(toastSuccess).toHaveBeenCalledWith('Workflow excluído');
  });

  it('bloqueia exclusão quando há solicitações vinculadas (FK em cascata)', async () => {
    linkedCount = 3;
    const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync('wf-1')).rejects.toBeInstanceOf(
        WorkflowInUseError
      );
    });
    expect(calls).toEqual([]);
    expect(toastError).toHaveBeenCalledWith(
      expect.stringContaining('3 solicitação(ões) vinculada(s)')
    );
  });
});
