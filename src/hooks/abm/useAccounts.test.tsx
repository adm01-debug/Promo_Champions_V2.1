import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: { message: string; code?: string } | null };

const calls: Array<{ op: string; args: unknown[] }> = [];
let nextResult: Result = { data: null, error: null };

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: { success: toastSuccess, error: toastError },
}));

vi.mock('@/integrations/supabase/client', () => {
  const builder = (table: string) => {
    calls.push({ op: 'from', args: [table] });
    const record =
      (op: string) =>
      (...args: unknown[]) => {
        calls.push({ op, args });
        return query;
      };
    const query = {
      update: record('update'),
      delete: record('delete'),
      eq: record('eq'),
      select: record('select'),
      maybeSingle: () => {
        calls.push({ op: 'maybeSingle', args: [] });
        return Promise.resolve(nextResult);
      },
      single: () => {
        calls.push({ op: 'single', args: [] });
        return Promise.resolve(nextResult);
      },
      then: (resolve: (value: Result) => unknown) =>
        Promise.resolve(nextResult).then(resolve),
    };
    return query;
  };
  return { supabase: { from: builder } };
});

const { useUpdateAccount, useDeleteAccount, useUpdateContact, useDeleteContact } =
  await import('./useAccounts');

let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client }, children);
}

const ops = () => calls.map(c => c.op);

describe('useUpdateAccount', () => {
  beforeEach(() => {
    calls.length = 0;
    toastSuccess.mockReset();
    toastError.mockReset();
    client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  });

  it('atualiza a conta pelo id, sem enviar o id no payload, e invalida a lista', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    nextResult = { data: { id: 'acc-1', name: 'Nova' }, error: null };
    const { result } = renderHook(() => useUpdateAccount(), { wrapper });

    let updated: unknown;
    await act(async () => {
      updated = await result.current.mutateAsync({ id: 'acc-1', name: 'Nova' });
    });

    expect(updated).toEqual({ id: 'acc-1', name: 'Nova' });
    expect(calls[0]).toEqual({ op: 'from', args: ['accounts'] });
    expect(calls.find(c => c.op === 'update')?.args[0]).toEqual({ name: 'Nova' });
    expect(calls.find(c => c.op === 'eq')?.args).toEqual(['id', 'acc-1']);
    expect(ops()).toContain('maybeSingle');
    expect(ops()).not.toContain('single');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['accounts'] });
    expect(toastSuccess).toHaveBeenCalledWith('Conta atualizada');
  });

  it('RLS com 0 linhas vira erro de permissão em PT-BR (sem mensagem crua do PostgREST)', async () => {
    nextResult = { data: null, error: null };
    const { result } = renderHook(() => useUpdateAccount(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'acc-1', name: 'X' })
      ).rejects.toThrow('Você não tem permissão para editar esta conta');
    });

    expect(toastError).toHaveBeenCalledWith(
      'Erro: Você não tem permissão para editar esta conta'
    );
    expect(toastError.mock.calls.flat().join(' ')).not.toMatch(/JSON object requested/);
  });

  it('nome duplicado (23505) mostra mensagem amigável', async () => {
    nextResult = { data: null, error: { message: 'duplicate key', code: '23505' } };
    const { result } = renderHook(() => useUpdateAccount(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'acc-1', name: 'Dup' })
      ).rejects.toBeTruthy();
    });

    expect(toastError).toHaveBeenCalledWith('Já existe uma conta com esse nome');
  });
});

describe('useDeleteAccount', () => {
  beforeEach(() => {
    calls.length = 0;
    toastSuccess.mockReset();
    toastError.mockReset();
    client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  });

  it('exclui pelo id, invalida a lista e descarta o cache da conta', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const remove = vi.spyOn(client, 'removeQueries');
    nextResult = { data: [{ id: 'acc-1' }], error: null };
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('acc-1');
    });

    expect(ops()).toEqual(['from', 'delete', 'eq', 'select']);
    expect(calls.find(c => c.op === 'eq')?.args).toEqual(['id', 'acc-1']);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['accounts'] });
    expect(remove).toHaveBeenCalledWith({ queryKey: ['account-contacts', 'acc-1'] });
    expect(remove).toHaveBeenCalledWith({ queryKey: ['account-plan', 'acc-1'] });
    expect(toastSuccess).toHaveBeenCalledWith('Conta excluída');
  });

  it('RLS com 0 linhas não finge sucesso: erro de permissão', async () => {
    nextResult = { data: [], error: null };
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('acc-1')).rejects.toThrow(
        'Você não tem permissão para excluir esta conta'
      );
    });

    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith(
      'Erro: Você não tem permissão para excluir esta conta'
    );
  });

  it('vínculo restritivo (23503) mostra mensagem amigável', async () => {
    nextResult = { data: null, error: { message: 'fk violation', code: '23503' } };
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('acc-1')).rejects.toBeTruthy();
    });

    expect(toastError).toHaveBeenCalledWith(
      'A conta possui registros vinculados e não pode ser excluída'
    );
  });
});

describe('contatos da conta ABM', () => {
  beforeEach(() => {
    calls.length = 0;
    toastSuccess.mockReset();
    toastError.mockReset();
    client = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
  });

  it('edita o contato sem enviar id nem account_id no payload e invalida a lista', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    nextResult = { data: { id: 'c1' }, error: null };
    const { result: hook } = renderHook(() => useUpdateContact(), { wrapper });

    await act(async () => {
      await hook.current.mutateAsync({
        id: 'c1',
        account_id: 'a1',
        name: 'Maria',
        job_title: null,
      });
    });

    expect(calls[0]).toEqual({ op: 'from', args: ['account_contacts'] });
    expect(calls.find(c => c.op === 'update')?.args[0]).toEqual({
      name: 'Maria',
      job_title: null,
    });
    expect(calls.find(c => c.op === 'eq')?.args).toEqual(['id', 'c1']);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['account-contacts', 'a1'] });
    expect(toastSuccess).toHaveBeenCalledWith('Contato atualizado');
  });

  it('acusa erro quando a edição não afeta nenhuma linha (RLS)', async () => {
    const { result: hook } = renderHook(() => useUpdateContact(), { wrapper });

    await act(async () => {
      await expect(
        hook.current.mutateAsync({ id: 'c1', account_id: 'a1', name: 'Maria' })
      ).rejects.toThrow('Contato não encontrado ou sem permissão para editar');
    });

    expect(toastError).toHaveBeenCalled();
  });

  it('exclui o contato e invalida a lista', async () => {
    nextResult = { data: [{ id: 'c1' }], error: null };
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result: hook } = renderHook(() => useDeleteContact(), { wrapper });

    await act(async () => {
      await hook.current.mutateAsync({ id: 'c1', account_id: 'a1' });
    });

    expect(calls.find(c => c.op === 'delete')).toBeTruthy();
    expect(calls.find(c => c.op === 'eq')?.args).toEqual(['id', 'c1']);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['account-contacts', 'a1'] });
    expect(toastSuccess).toHaveBeenCalledWith('Contato excluído');
  });

  it('acusa erro quando a exclusão não remove nenhuma linha (RLS)', async () => {
    nextResult = { data: [], error: null };
    const { result: hook } = renderHook(() => useDeleteContact(), { wrapper });

    await act(async () => {
      await expect(
        hook.current.mutateAsync({ id: 'c1', account_id: 'a1' })
      ).rejects.toThrow('Contato não encontrado ou sem permissão para excluir');
    });

    expect(toastError).toHaveBeenCalled();
  });
});
