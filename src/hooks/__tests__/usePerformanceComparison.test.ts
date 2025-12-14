import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

import { usePerformanceComparison } from '../usePerformanceComparison';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const createMockChain = (data: any) => ({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        lte: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
    gte: vi.fn().mockReturnValue({
      lte: vi.fn().mockResolvedValue({ data, error: null }),
    }),
  }),
});

describe('usePerformanceComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => createMockChain([]));
  });

  it('should fetch salespeople data', () => {
    renderHook(() => usePerformanceComparison(), { wrapper: createWrapper() });
    expect(mockFrom).toHaveBeenCalledWith('salespeople');
  });

  it('should fetch sales data', () => {
    renderHook(() => usePerformanceComparison(), { wrapper: createWrapper() });
    expect(mockFrom).toHaveBeenCalledWith('sales');
  });

  it('should fetch activities data', () => {
    renderHook(() => usePerformanceComparison(), { wrapper: createWrapper() });
    expect(mockFrom).toHaveBeenCalledWith('activities');
  });

  it('should fetch goals data', () => {
    renderHook(() => usePerformanceComparison(), { wrapper: createWrapper() });
    expect(mockFrom).toHaveBeenCalledWith('sales_goals');
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => usePerformanceComparison(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should accept month parameter', () => {
    const customMonth = new Date(2024, 5, 1);
    renderHook(() => usePerformanceComparison(customMonth), {
      wrapper: createWrapper(),
    });

    expect(mockFrom).toHaveBeenCalled();
  });

  it('should have data undefined before fetch completes', () => {
    const { result } = renderHook(() => usePerformanceComparison(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
  });

  it('should call all required tables', () => {
    renderHook(() => usePerformanceComparison(), { wrapper: createWrapper() });

    const calledTables = mockFrom.mock.calls.map((call) => call[0]);
    expect(calledTables).toContain('salespeople');
    expect(calledTables).toContain('sales');
    expect(calledTables).toContain('activities');
    expect(calledTables).toContain('sales_goals');
  });
});
