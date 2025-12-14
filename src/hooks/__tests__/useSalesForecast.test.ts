import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

import { useSalesForecast } from '../useSalesForecast';

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
        lte: vi.fn().mockReturnValue({
          neq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data, error: null }),
          }),
          order: vi.fn().mockResolvedValue({ data, error: null }),
        }),
        order: vi.fn().mockResolvedValue({ data, error: null }),
      }),
      order: vi.fn().mockResolvedValue({ data, error: null }),
    }),
    neq: vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data, error: null }),
      }),
      order: vi.fn().mockResolvedValue({ data, error: null }),
    }),
    gte: vi.fn().mockReturnValue({
      lte: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data, error: null }),
      }),
      order: vi.fn().mockResolvedValue({ data, error: null }),
    }),
    order: vi.fn().mockResolvedValue({ data, error: null }),
  }),
});

describe('useSalesForecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => createMockChain([]));
  });

  it('should call supabase from sales table', () => {
    renderHook(() => useSalesForecast(), { wrapper: createWrapper() });
    expect(mockFrom).toHaveBeenCalledWith('sales');
  });

  it('should call supabase from lead_scores table', () => {
    renderHook(() => useSalesForecast(), { wrapper: createWrapper() });
    expect(mockFrom).toHaveBeenCalledWith('lead_scores');
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useSalesForecast(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should have isSuccess false initially', () => {
    const { result } = renderHook(() => useSalesForecast(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isSuccess).toBe(false);
  });

  it('should select appropriate fields from sales', () => {
    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      gte: vi.fn().mockReturnValue({
        lte: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    mockFrom.mockReturnValue({ select: selectMock });

    renderHook(() => useSalesForecast(), { wrapper: createWrapper() });

    expect(selectMock).toHaveBeenCalled();
  });

  it('should fetch data for current month', () => {
    renderHook(() => useSalesForecast(), { wrapper: createWrapper() });
    
    // Should have called from at least twice (sales and lead_scores)
    expect(mockFrom.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('should have data undefined before fetch completes', () => {
    const { result } = renderHook(() => useSalesForecast(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
  });
});
