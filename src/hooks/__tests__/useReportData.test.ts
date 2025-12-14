import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

import { useReportMetrics } from '../useReportData';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const createMockChain = (data: any) => ({
  select: vi.fn().mockReturnValue({
    gte: vi.fn().mockReturnValue({
      lte: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
    order: vi.fn().mockResolvedValue({ data, error: null }),
  }),
});

const defaultDateRange = {
  from: new Date('2024-01-01'),
  to: new Date('2024-01-31'),
};

describe('useReportMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => createMockChain([]));
  });

  it('should fetch sales data', () => {
    renderHook(() => useReportMetrics(defaultDateRange), {
      wrapper: createWrapper(),
    });
    expect(mockFrom).toHaveBeenCalledWith('sales');
  });

  it('should fetch daily_metrics data', () => {
    renderHook(() => useReportMetrics(defaultDateRange), {
      wrapper: createWrapper(),
    });
    expect(mockFrom).toHaveBeenCalledWith('daily_metrics');
  });

  it('should fetch category_metrics data', () => {
    renderHook(() => useReportMetrics(defaultDateRange), {
      wrapper: createWrapper(),
    });
    expect(mockFrom).toHaveBeenCalledWith('category_metrics');
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useReportMetrics(defaultDateRange), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle date range with from and to dates', () => {
    const dateRange = {
      from: new Date('2024-06-01'),
      to: new Date('2024-06-30'),
    };

    renderHook(() => useReportMetrics(dateRange), {
      wrapper: createWrapper(),
    });

    expect(mockFrom).toHaveBeenCalled();
  });

  it('should call all required tables', () => {
    renderHook(() => useReportMetrics(defaultDateRange), {
      wrapper: createWrapper(),
    });

    const calledTables = mockFrom.mock.calls.map((call) => call[0]);
    expect(calledTables).toContain('sales');
    expect(calledTables).toContain('daily_metrics');
    expect(calledTables).toContain('category_metrics');
  });

  it('should have error null initially', () => {
    const { result } = renderHook(() => useReportMetrics(defaultDateRange), {
      wrapper: createWrapper(),
    });

    expect(result.current.error).toBeNull();
  });
});
