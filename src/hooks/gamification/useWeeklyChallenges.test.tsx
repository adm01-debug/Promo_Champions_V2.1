import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createElement } from 'react';

const calls: {
  table?: string;
  update?: unknown;
  eq?: [string, unknown];
  select?: string;
} = {};
let result: { data: unknown[] | null; error: { message: string } | null } = {
  data: [],
  error: null,
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      calls.table = table;
      const builder = {
        update: (values: unknown) => {
          calls.update = values;
          return builder;
        },
        eq: (column: string, value: unknown) => {
          calls.eq = [column, value];
          return builder;
        },
        select: (columns: string) => {
          calls.select = columns;
          return Promise.resolve(result);
        },
      };
      return builder;
    },
  },
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

import { useDeactivateWeeklyChallenge } from './useWeeklyChallenges';

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  const { result: hook } = renderHook(() => useDeactivateWeeklyChallenge(), { wrapper });
  return { hook, invalidate };
}

describe('useDeactivateWeeklyChallenge', () => {
  beforeEach(() => {
    for (const k of Object.keys(calls)) delete calls[k as keyof typeof calls];
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  it('desativa via is_active=false (soft-delete) e invalida a lista', async () => {
    result = { data: [{ id: 'c1' }], error: null };
    const { hook, invalidate } = setup();

    await act(async () => {
      await hook.current.mutateAsync('c1');
    });

    expect(calls.table).toBe('weekly_challenges');
    expect(calls.update).toEqual({ is_active: false });
    expect(calls.eq).toEqual(['id', 'c1']);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['weekly-challenges'] });
    expect(toastSuccess).toHaveBeenCalledWith('Desafio desativado');
  });

  it('trata 0 linhas afetadas (bloqueio de RLS) como erro', async () => {
    result = { data: [], error: null };
    const { hook, invalidate } = setup();

    act(() => {
      hook.current.mutate('c2');
    });

    await waitFor(() => expect(hook.current.isError).toBe(true));
    expect(toastError).toHaveBeenCalledWith('Erro ao desativar desafio');
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('propaga erro do Supabase com toast', async () => {
    result = { data: null, error: { message: 'falhou' } };
    const { hook } = setup();

    act(() => {
      hook.current.mutate('c3');
    });

    await waitFor(() => expect(hook.current.isError).toBe(true));
    expect(toastError).toHaveBeenCalledWith('Erro ao desativar desafio');
  });
});
