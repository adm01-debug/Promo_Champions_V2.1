import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardKPIsPeriod } from './useDashboardKPIsPeriod';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase RPC
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDashboardKPIsPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve buscar KPIs para o período atual corretamente', async () => {
    const mockData = {
      totalRevenue: 10000,
      totalSales: 50,
      newClients: 10,
      conversionRate: 5.5,
      avgTicket: 200,
    };

    (supabase.rpc as any).mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useDashboardKPIsPeriod('current_month'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.current).toEqual(mockData);
    expect(supabase.rpc).toHaveBeenCalledWith('get_dashboard_kpis_v2', expect.any(Object));
  });

  it('deve calcular as mudanças percentuais corretamente', async () => {
    // Mock para o período atual e anterior (duas chamadas ao RPC)
    (supabase.rpc as any)
      .mockResolvedValueOnce({ 
        data: { totalRevenue: 120, totalSales: 10, newClients: 5, conversionRate: 10, avgTicket: 12 }, 
        error: null 
      })
      .mockResolvedValueOnce({ 
        data: { totalRevenue: 100, totalSales: 8, newClients: 4, conversionRate: 8, avgTicket: 10 }, 
        error: null 
      });

    const { result } = renderHook(() => useDashboardKPIsPeriod('current_month'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Crescimento de 100 para 120 = 20%
    expect(result.current.data?.changes.revenue).toBe(20);
    // Crescimento de 8 para 10 = 25%
    expect(result.current.data?.changes.sales).toBe(25);
  });

  it('deve lidar com erros no RPC', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: null, error: new Error('Erro no banco') });

    const { result } = renderHook(() => useDashboardKPIsPeriod('current_month'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
