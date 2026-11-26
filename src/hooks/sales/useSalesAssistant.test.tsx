import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Op = { table: string; op: string; args: unknown[] };
type DeleteResult = { error: { message: string } | null };

const ops: Op[] = [];
// Resultado por tabela: sem entrada = { error: null }.
const deleteResults = new Map<string, DeleteResult>();

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({ toast: { success: toastSuccess, error: toastError } }));

interface QueryMock {
  delete: (...args: unknown[]) => QueryMock;
  select: (...args: unknown[]) => QueryMock;
  eq: (...args: unknown[]) => QueryMock;
  order: (...args: unknown[]) => QueryMock;
  limit: (...args: unknown[]) => QueryMock;
  then: (resolve: (value: DeleteResult) => unknown) => Promise<unknown>;
}

vi.mock('@/integrations/supabase/client', () => {
  const builder = (table: string): QueryMock => {
    const record =
      (op: string) =>
      (...args: unknown[]) => {
        ops.push({ table, op, args });
        return query;
      };
    const query: QueryMock = {
      delete: record('delete'),
      select: record('select'),
      eq: record('eq'),
      order: record('order'),
      limit: record('limit'),
      then: (resolve: (value: DeleteResult) => unknown) =>
        Promise.resolve(deleteResults.get(table) ?? { error: null }).then(resolve),
    };
    return query;
  };
  return {
    supabase: {
      from: (table: string) => {
        ops.push({ table, op: 'from', args: [] });
        return builder(table);
      },
      auth: { getUser: () => Promise.resolve({ data: { user: null } }) },
    },
  };
});

const { useSalesAssistant } = await import('./useSalesAssistant');

let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client }, children);
}

describe('useSalesAssistant.deleteConversation', () => {
  beforeEach(() => {
    ops.length = 0;
    deleteResults.clear();
    toastSuccess.mockReset();
    toastError.mockReset();
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it('RLS bloqueia as mensagens: avisa o usuario e preserva a conversa', async () => {
    deleteResults.set('chat_messages', {
      error: { message: 'permission denied for table chat_messages' },
    });
    const { result } = renderHook(() => useSalesAssistant(null), { wrapper });

    await act(async () => {
      await result.current.deleteConversation('conv-1');
    });

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(String(toastError.mock.calls[0]?.[0])).toContain('mensagens');
    // Antes do conserto a conversa era apagada mesmo com as mensagens presas,
    // deixando mensagens orfas em producao.
    expect(ops.some(o => o.table === 'chat_conversations')).toBe(false);
  });

  it('sucesso: apaga mensagens e depois a conversa, sem aviso de erro', async () => {
    const { result } = renderHook(() => useSalesAssistant(null), { wrapper });

    await act(async () => {
      await result.current.deleteConversation('conv-2');
    });

    expect(ops.filter(o => o.op === 'delete').map(o => o.table)).toEqual([
      'chat_messages',
      'chat_conversations',
    ]);
    expect(ops.filter(o => o.op === 'eq').map(o => o.args)).toEqual([
      ['conversation_id', 'conv-2'],
      ['id', 'conv-2'],
    ]);
    expect(toastError).not.toHaveBeenCalled();
  });
});
