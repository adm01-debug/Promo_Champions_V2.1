import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state: {
  currentSalespersonId: string | null;
  rpcCalls: string[];
  inserts: Array<Record<string, unknown>>;
} = { currentSalespersonId: 'sp-logado', rpcCalls: [], inserts: [] };

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: (fn: string) => {
      state.rpcCalls.push(fn);
      return Promise.resolve({ data: state.currentSalespersonId, error: null });
    },
    from: (table: string) => {
      if (table !== 'tasks') throw new Error(`tabela inesperada ${table}`);
      const q = {
        insert: (rows: Array<Record<string, unknown>>) => {
          state.inserts.push(...rows);
          return q;
        },
        select: () => q,
        single: () => Promise.resolve({ data: { id: 'task-1' }, error: null }),
      };
      return q;
    },
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { useCreateTask } = await import('./useTaskMutations');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

const base = { title: 'Ligar cliente', due_date: '2026-11-13' };

describe('useCreateTask — dono da tarefa (policy de INSERT de tasks)', () => {
  beforeEach(() => {
    state.currentSalespersonId = 'sp-logado';
    state.rpcCalls = [];
    state.inserts = [];
  });

  it('sem responsável escolhido, grava a tarefa com o vendedor logado', async () => {
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    await act(() => result.current.mutateAsync({ ...base }));

    expect(state.rpcCalls).toEqual(['get_current_salesperson_id']);
    expect(state.inserts[0].salesperson_id).toBe('sp-logado');
  });

  it('responsável vazio ("") também cai no vendedor logado', async () => {
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    await act(() => result.current.mutateAsync({ ...base, salesperson_id: '' }));

    expect(state.inserts[0].salesperson_id).toBe('sp-logado');
  });

  it('respeita o responsável escolhido sem consultar o vendedor logado', async () => {
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    await act(() => result.current.mutateAsync({ ...base, salesperson_id: 'sp-outro' }));

    expect(state.rpcCalls).toEqual([]);
    expect(state.inserts[0].salesperson_id).toBe('sp-outro');
  });

  it('usuário sem cadastro de vendedor (ex.: admin) segue com responsável nulo', async () => {
    state.currentSalespersonId = null;
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    await act(() => result.current.mutateAsync({ ...base }));

    expect(state.inserts[0].salesperson_id).toBeNull();
  });
});
