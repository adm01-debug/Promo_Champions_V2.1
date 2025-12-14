import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { usePipelineDeals, PIPELINE_STAGES } from '../usePipeline';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('usePipelineDeals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
  });

  it('should call supabase from sales table', () => {
    renderHook(() => usePipelineDeals(), { wrapper: createWrapper() });
    expect(mockFrom).toHaveBeenCalledWith('sales');
  });

  it('should have correct pipeline stages', () => {
    expect(PIPELINE_STAGES).toHaveLength(5);
    expect(PIPELINE_STAGES[0].id).toBe('lead');
    expect(PIPELINE_STAGES[4].id).toBe('completed');
  });
});
