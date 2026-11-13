import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: { message: string; code?: string } | null };

const calls: Array<{ op: string; args: unknown[] }> = [];
let nextResult: Result = { data: null, error: null };
// Fila opcional para hooks com mais de uma chamada; vazia = usa nextResult.
const queuedResults: Result[] = [];
const takeResult = () => queuedResults.shift() ?? nextResult;
let currentUser: { id: string } | null = { id: 'user-1' };

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
      insert: record('insert'),
      delete: record('delete'),
      eq: record('eq'),
      select: record('select'),
      maybeSingle: () => {
        calls.push({ op: 'maybeSingle', args: [] });
        return Promise.resolve(takeResult());
      },
      single: () => {
        calls.push({ op: 'single', args: [] });
        return Promise.resolve(takeResult());
      },
      then: (resolve: (value: Result) => unknown) =>
        Promise.resolve(takeResult()).then(resolve),
    };
    return query;
  };
  return {
    supabase: {
      from: builder,
      auth: { getUser: () => Promise.resolve({ data: { user: currentUser } }) },
    },
  };
});

const {
  useUpdateAccount,
  useDeleteAccount,
  useUpdateContact,
  useDeleteContact,
  useUpdateAccountPlan,
} = await import('./useAccounts');

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
    nextResult = { data: null, error: null };
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

describe('useUpdateAccountPlan', () => {
  beforeEach(() => {
    calls.length = 0;
    queuedResults.length = 0;
    toastSuccess.mockReset();
    toastError.mockReset();
    client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  });

  it('plano existente: atualiza pela conta e invalida o cache do plano', async () => {
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    queuedResults.push(
      { data: { id: 'plan-1' }, error: null },
      { data: { id: 'plan-1', account_strategy: 'Expandir' }, error: null }
    );
    const { result } = renderHook(() => useUpdateAccountPlan(), { wrapper });

    let saved: unknown;
    await act(async () => {
      saved = await result.current.mutateAsync({
        account_id: 'acc-1',
        account_strategy: 'Expandir',
      });
    });

    expect(saved).toEqual({ id: 'plan-1', account_strategy: 'Expandir' });
    expect(calls.find(c => c.op === 'update')?.args[0]).toEqual({
      account_strategy: 'Expandir',
    });
    expect(ops().filter(o => o === 'maybeSingle')).toHaveLength(2);
    expect(ops()).not.toContain('single');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['account-plan', 'acc-1'] });
    expect(toastSuccess).toHaveBeenCalledWith('Plano de conta atualizado');
  });

  it('RLS com 0 linhas no update vira erro de permissão em PT-BR', async () => {
    queuedResults.push(
      { data: { id: 'plan-1' }, error: null },
      { data: null, error: null }
    );
    const { result } = renderHook(() => useUpdateAccountPlan(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ account_id: 'acc-1', account_strategy: 'X' })
      ).rejects.toThrow('Sem permissão para editar o plano da conta.');
    });

    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith(
      'Erro: Sem permissão para editar o plano da conta.'
    );
    expect(toastError.mock.calls.flat().join(' ')).not.toMatch(/JSON object requested/);
  });

  it('sem plano: cria um novo para a conta', async () => {
    queuedResults.push(
      { data: null, error: null },
      { data: { id: 'plan-2', account_id: 'acc-1' }, error: null }
    );
    const { result } = renderHook(() => useUpdateAccountPlan(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ account_id: 'acc-1', fiscal_year: '2026' });
    });

    expect(calls.find(c => c.op === 'insert')?.args[0]).toEqual({
      account_id: 'acc-1',
      fiscal_year: '2026',
      created_by: 'user-1',
    });
    expect(ops()).not.toContain('update');
    expect(toastSuccess).toHaveBeenCalledWith('Plano de conta atualizado');
  });

  it('sem sessão: não tenta inserir e avisa para entrar de novo', async () => {
    currentUser = null;
    queuedResults.push({ data: null, error: null });
    const { result } = renderHook(() => useUpdateAccountPlan(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ account_id: 'acc-1', fiscal_year: '2026' })
      ).rejects.toThrow('Sessão expirada');
    });

    expect(ops()).not.toContain('insert');
    expect(toastSuccess).not.toHaveBeenCalled();
    currentUser = { id: 'user-1' };
  });
});
