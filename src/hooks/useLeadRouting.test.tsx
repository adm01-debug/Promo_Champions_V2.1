import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mocks,
}));

const {
  useAutoRouteToTopPerformer,
  useLeadRouting,
  useRouteLeadManually,
  useRoundRobinRoute,
} = await import('./useLeadRouting');

const routingResult = {
  assigned_to: 'seller-1',
  portfolio_id: 'portfolio-1',
  strategy_used: 'round_robin',
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useLeadRouting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.rpc.mockResolvedValue({ data: [routingResult], error: null });
  });

  it('delega round-robin à RPC transacional sem gravar estado no navegador', async () => {
    const { result } = renderHook(() => useRoundRobinRoute(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ clientId: 'client-1' });
    });

    expect(mocks.rpc).toHaveBeenCalledWith('route_unassigned_client_portfolio', {
      p_client_id: 'client-1',
      p_strategy: 'round_robin',
      p_reason: 'Roteamento automático round-robin',
    });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(localStorage.getItem('lastAssignedIndex')).toBeNull();
  });

  it('mantém as estratégias de melhor desempenho e manual no contrato do servidor', async () => {
    const { result: topPerformer } = renderHook(() => useAutoRouteToTopPerformer(), {
      wrapper,
    });
    await act(async () => {
      await topPerformer.current.mutateAsync({ clientId: 'client-top' });
    });

    expect(mocks.rpc).toHaveBeenLastCalledWith('route_unassigned_client_portfolio', {
      p_client_id: 'client-top',
      p_strategy: 'top_performer',
      p_reason: 'Roteamento automático para melhor desempenho',
    });

    const { result: manual } = renderHook(() => useRouteLeadManually(), { wrapper });
    await act(async () => {
      await manual.current.mutateAsync({
        clientId: 'client-manual',
        toSalespersonId: 'seller-manual',
        reason: 'Redistribuição aprovada',
      });
    });

    expect(mocks.rpc).toHaveBeenLastCalledWith('route_unassigned_client_portfolio', {
      p_client_id: 'client-manual',
      p_strategy: 'manual',
      p_salesperson_id: 'seller-manual',
      p_reason: 'Redistribuição aprovada',
    });
  });

  it('recusa estratégia sem implementação no servidor em vez de escolher um vendedor arbitrário', async () => {
    const { result } = renderHook(() => useLeadRouting('territory'), { wrapper });

    await expect(result.current.mutateAsync('client-unsupported')).rejects.toThrow(
      'ainda não possui contrato de roteamento no servidor'
    );

    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
