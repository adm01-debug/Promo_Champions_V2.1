import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const from = vi.fn();
const update = vi.fn();
const del = vi.fn();
const eq = vi.fn();
let result: { data: unknown; error: unknown } = { data: null, error: null };

vi.mock('@/integrations/supabase/client', () => {
  const query = {
    update: (payload: unknown) => {
      update(payload);
      return query;
    },
    delete: () => {
      del();
      return query;
    },
    eq: (column: string, value: unknown) => {
      eq(column, value);
      return query;
    },
    select: () => query,
    maybeSingle: () => Promise.resolve(result),
    then: (resolve: (value: typeof result) => unknown) =>
      Promise.resolve(result).then(resolve),
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

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: { success: toastSuccess, error: toastError },
}));

const { useUpdateContact, useDeleteContact } = await import('./useAccounts');

let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client }, children);
}

describe('contatos da conta ABM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    result = { data: null, error: null };
  });

  it('edita o contato sem enviar id nem account_id no payload e invalida a lista', async () => {
    result = { data: { id: 'c1' }, error: null };
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result: hook } = renderHook(() => useUpdateContact(), { wrapper });

    await act(async () => {
      await hook.current.mutateAsync({
        id: 'c1',
        account_id: 'a1',
        name: 'Maria',
        job_title: null,
      });
    });

    expect(from).toHaveBeenCalledWith('account_contacts');
    expect(update).toHaveBeenCalledWith({ name: 'Maria', job_title: null });
    expect(eq).toHaveBeenCalledWith('id', 'c1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['account-contacts', 'a1'] });
    expect(toastSuccess).toHaveBeenCalledWith('Contato atualizado');
  });

  it('acusa erro quando a edição não afeta nenhuma linha (RLS)', async () => {
    const { result: hook } = renderHook(() => useUpdateContact(), { wrapper });

    await act(async () => {
      await expect(
        hook.current.mutateAsync({ id: 'c1', account_id: 'a1', name: 'Maria' })
      ).rejects.toThrow('sem permissão para editar');
    });

    expect(toastError).toHaveBeenCalled();
  });

  it('exclui o contato e invalida a lista', async () => {
    result = { data: [{ id: 'c1' }], error: null };
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result: hook } = renderHook(() => useDeleteContact(), { wrapper });

    await act(async () => {
      await hook.current.mutateAsync({ id: 'c1', account_id: 'a1' });
    });

    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'c1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['account-contacts', 'a1'] });
    expect(toastSuccess).toHaveBeenCalledWith('Contato excluído');
  });

  it('acusa erro quando a exclusão não remove nenhuma linha (RLS)', async () => {
    result = { data: [], error: null };
    const { result: hook } = renderHook(() => useDeleteContact(), { wrapper });

    await act(async () => {
      await expect(
        hook.current.mutateAsync({ id: 'c1', account_id: 'a1' })
      ).rejects.toThrow('sem permissão para excluir');
    });

    expect(toastError).toHaveBeenCalled();
  });
});
