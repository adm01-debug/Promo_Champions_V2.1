import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: mocks.rpc,
  },
}));

vi.mock('sonner', () => ({ toast }));

const { useAssignClient } = await import('./useClientPortfolio');

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useAssignClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({ data: [], error: null });
  });

  it('usa a RPC de atribuição manual, que é idempotente e registra auditoria no banco', async () => {
    const { result } = renderHook(() => useAssignClient(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        clientId: 'client-1',
        salespersonId: 'seller-1',
        source: 'manual',
      });
    });

    expect(mocks.rpc).toHaveBeenCalledWith('route_unassigned_client_portfolio', {
      p_client_id: 'client-1',
      p_strategy: 'manual',
      p_salesperson_id: 'seller-1',
      p_reason: 'Atribuição de carteira: manual',
    });
    expect(toast.success).toHaveBeenCalledWith('Cliente atribuído com sucesso!');
  });
});
