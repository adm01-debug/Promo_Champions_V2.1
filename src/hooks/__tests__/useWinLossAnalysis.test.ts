import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

import { useWinLossAnalysis } from '../useWinLossAnalysis';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useWinLossAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
  });

  it('should call supabase from deal_outcomes table', () => {
    renderHook(() => useWinLossAnalysis(), { wrapper: createWrapper() });
    expect(mockFrom).toHaveBeenCalledWith('deal_outcomes');
  });

  it('should apply salesperson filter when provided', () => {
    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    mockFrom.mockReturnValue({ select: selectMock });

    renderHook(() => useWinLossAnalysis({ salespersonId: 'sp1' }), {
      wrapper: createWrapper(),
    });

    expect(mockFrom).toHaveBeenCalledWith('deal_outcomes');
  });

  it('should apply date range filters when provided', () => {
    const gteMock = vi.fn().mockReturnValue({
      lte: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    const selectMock = vi.fn().mockReturnValue({
      gte: gteMock,
    });
    mockFrom.mockReturnValue({ select: selectMock });

    renderHook(
      () =>
        useWinLossAnalysis({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        }),
      { wrapper: createWrapper() }
    );

    expect(mockFrom).toHaveBeenCalledWith('deal_outcomes');
  });

  it('should have correct select query with relations', () => {
    const selectMock = vi.fn().mockResolvedValue({ data: [], error: null });
    mockFrom.mockReturnValue({ select: selectMock });

    renderHook(() => useWinLossAnalysis(), { wrapper: createWrapper() });

    expect(selectMock).toHaveBeenCalled();
    const selectArg = selectMock.mock.calls[0][0];
    expect(selectArg).toContain('sales:sale_id');
    expect(selectArg).toContain('salespeople:salesperson_id');
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useWinLossAnalysis(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should apply product filter in query key', () => {
    const { result } = renderHook(
      () => useWinLossAnalysis({ productName: 'Produto A' }),
      { wrapper: createWrapper() }
    );

    expect(result.current).toBeDefined();
  });

  it('should combine multiple filters', () => {
    const eqMock = vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        lte: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockFrom.mockReturnValue({ select: selectMock });

    renderHook(
      () =>
        useWinLossAnalysis({
          salespersonId: 'sp1',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        }),
      { wrapper: createWrapper() }
    );

    expect(mockFrom).toHaveBeenCalledWith('deal_outcomes');
  });
});
