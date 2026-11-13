import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls = vi.hoisted(() => ({
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  result: { data: { id: 'tpl-1' } as unknown, error: null as unknown },
}));

vi.mock('@/integrations/supabase/client', () => {
  const query = {
    update: (changes: unknown) => {
      calls.update(changes);
      return query;
    },
    eq: (col: string, val: unknown) => {
      calls.eq(col, val);
      return query;
    },
    select: () => query,
    single: () => Promise.resolve(calls.result),
  };
  return {
    supabase: {
      from: (table: string) => {
        calls.from(table);
        return query;
      },
    },
  };
});

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { toast } = await import('sonner');
const { useUpdateTemplate } = await import('./useMultichannel');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

const changes = {
  name: 'Retorno',
  channel: 'whatsapp' as const,
  body: 'Oi {{singu_lead_name}}',
  variables: ['singu_lead_name'],
};

describe('useUpdateTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    calls.result = { data: { id: 'tpl-1' }, error: null };
  });

  it('atualiza a linha em message_templates pelo id', async () => {
    const { result } = renderHook(() => useUpdateTemplate(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 'tpl-1', ...changes });
    });

    expect(calls.from).toHaveBeenCalledWith('message_templates');
    expect(calls.update).toHaveBeenCalledWith(changes);
    expect(calls.eq).toHaveBeenCalledWith('id', 'tpl-1');
    expect(toast.success).toHaveBeenCalledWith('Template atualizado');
  });

  it('propaga erro do banco sem toast de sucesso', async () => {
    calls.result = { data: null, error: { message: 'RLS' } };
    const { result } = renderHook(() => useUpdateTemplate(), { wrapper });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'tpl-1', ...changes })
      ).rejects.toBeTruthy();
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar template');
  });
});
