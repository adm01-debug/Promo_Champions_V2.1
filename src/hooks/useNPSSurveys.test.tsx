import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const insertMock = vi.fn();
const rpcMock = vi.fn();

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ insert: insertMock }),
    rpc: (fn: string) => rpcMock(fn),
  },
}));

const { useCreateNPSSurvey } = await import('./useNPSSurveys');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useCreateNPSSurvey', () => {
  beforeEach(() => {
    insertMock.mockReset().mockResolvedValue({ error: null });
    rpcMock.mockReset().mockResolvedValue({ data: 'sp-logado', error: null });
  });

  it('grava a pesquisa no vendedor logado quando a tela não informa o dono', async () => {
    const { result } = renderHook(() => useCreateNPSSurvey(), { wrapper });

    await act(() => result.current.mutateAsync({ client_name: 'Cliente X' }));

    expect(rpcMock).toHaveBeenCalledWith('get_current_salesperson_id');
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({ client_name: 'Cliente X', salesperson_id: 'sp-logado' }),
    ]);
  });

  it('respeita o salesperson_id explícito sem consultar o vendedor logado', async () => {
    const { result } = renderHook(() => useCreateNPSSurvey(), { wrapper });

    await act(() =>
      result.current.mutateAsync({ client_name: 'Cliente Y', salesperson_id: 'sp-outro' })
    );

    expect(rpcMock).not.toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({ salesperson_id: 'sp-outro' }),
    ]);
  });
});
