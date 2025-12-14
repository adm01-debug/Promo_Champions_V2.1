import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { useDashboardKPIs } from '../useDashboardKPIs';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDashboardKPIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }));
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useDashboardKPIs(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('should call supabase from sales table', () => {
    renderHook(() => useDashboardKPIs(), { wrapper: createWrapper() });
    expect(mockFrom).toHaveBeenCalledWith('sales');
  });
});
