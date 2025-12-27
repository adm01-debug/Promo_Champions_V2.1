import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDemandForecast } from '../useDemandForecast';
import type { ReactNode } from 'react';

const mockFunctions = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { 
    functions: {
      invoke: (...args: unknown[]) => mockFunctions(...args)
    }
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

describe('useDemandForecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch forecast data successfully', async () => {
    const mockForecast = {
      product_id: 'product-1',
      forecast_period: '2024-02',
      predicted_quantity: 150,
      confidence_low: 120,
      confidence_high: 180,
      trend: 'increasing',
    };

    mockFunctions.mockResolvedValue({
      data: mockForecast,
      error: null,
    });

    const { result } = renderHook(() => useDemandForecast('product-1'), { wrapper });
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.data).toEqual(mockForecast);
    expect(mockFunctions).toHaveBeenCalledWith('demand-forecast', {
      body: { product_id: 'product-1' },
    });
  });

  it('should handle edge function errors', async () => {
    const mockError = new Error('Edge function failed');

    mockFunctions.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useDemandForecast('product-1'), { wrapper });
    
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });

  it('should not call function when productId is undefined', () => {
    const { result } = renderHook(() => useDemandForecast(), { wrapper });
    
    expect(result.current.data).toBeUndefined();
    expect(mockFunctions).not.toHaveBeenCalled();
  });

  it('should handle forecast with decreasing trend', async () => {
    const mockForecast = {
      product_id: 'product-2',
      forecast_period: '2024-03',
      predicted_quantity: 80,
      confidence_low: 60,
      confidence_high: 100,
      trend: 'decreasing',
    };

    mockFunctions.mockResolvedValue({
      data: mockForecast,
      error: null,
    });

    const { result } = renderHook(() => useDemandForecast('product-2'), { wrapper });
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.data?.trend).toBe('decreasing');
    expect(result.current.data?.predicted_quantity).toBe(80);
  });
});
