import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDemandForecast } from '../useDemandForecast';
import React, { type ReactNode } from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { 
    functions: {
      invoke: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      }))
    }))
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { retry: false },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useDemandForecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return forecast functions and state', () => {
    const { result } = renderHook(() => useDemandForecast(), { wrapper });
    
    expect(result.current.generateForecasts).toBeDefined();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.forecastsLoading).toBeDefined();
  });

  it('should have inventory functions', () => {
    const { result } = renderHook(() => useDemandForecast(), { wrapper });
    
    expect(result.current.updateInventory).toBeDefined();
    expect(result.current.isUpdatingInventory).toBe(false);
  });

  it('should have movement functions', () => {
    const { result } = renderHook(() => useDemandForecast(), { wrapper });
    
    expect(result.current.recordMovement).toBeDefined();
    expect(result.current.isRecordingMovement).toBe(false);
  });
});
