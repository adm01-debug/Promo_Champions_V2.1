import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGamificationData } from '../useGamificationData';
import React, { type ReactNode } from 'react';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { 
    from: (...args: unknown[]) => mockFrom(...args) 
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { retry: false },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useGamificationData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: null 
          }),
          maybeSingle: vi.fn().mockResolvedValue({ 
            data: null, 
            error: null 
          }),
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
  });

  it('should return gamification data structure', () => {
    const { result } = renderHook(() => useGamificationData(), { wrapper });
    
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBeDefined();
  });

  it('should have loading state', () => {
    const { result } = renderHook(() => useGamificationData(), { wrapper });
    
    expect(result.current.isLoading).toBeDefined();
  });
});
