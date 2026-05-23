import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardKPIsPeriod } from './useDashboardKPIsPeriod';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
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

  it('deve buscar KPIs corretamente', async () => {
    const mockSales = [
      { amount: 1000, status: 'completed', created_at: new Date().toISOString() },
    ];
    const mockTasks = [];
    const mockMetrics = [];

    (supabase.from as any).mockImplementation((table: string) => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (cb: any) => {
        if (table === 'sales') return cb({ data: mockSales, error: null });
        if (table === 'tasks') return cb({ data: mockTasks, error: null });
        if (table === 'daily_metrics') return cb({ data: mockMetrics, error: null });
        return cb({ data: [], error: null });
      }
    }));

    const { result } = renderHook(() => useDashboardKPIsPeriod('current_month'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.current.totalRevenue).toBe(1000);
    expect(result.current.data?.current.totalSales).toBe(1);
  });
});

