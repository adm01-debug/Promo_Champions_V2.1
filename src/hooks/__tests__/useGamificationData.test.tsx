import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
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
  });

  it('should fetch XP data correctly', async () => {
    const mockData = {
      id: '1',
      salesperson_id: 'salesperson-1',
      total_xp: 1500,
      current_level: 5,
      current_streak: 3,
      longest_streak: 7,
      created_at: '2024-01-01',
      updated_at: '2024-01-15',
    };

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ 
          data: [mockData], 
          error: null 
        }),
      }),
    });

    const { result } = renderHook(() => useGamificationData('salesperson-1'), { wrapper });
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.data).toEqual(mockData);
    expect(mockFrom).toHaveBeenCalledWith('gamification_data');
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Database error');

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ 
          data: null, 
          error: mockError 
        }),
      }),
    });

    const { result } = renderHook(() => useGamificationData('salesperson-1'), { wrapper });
    
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });

  it('should return undefined when salespersonId is not provided', async () => {
    const { result } = renderHook(() => useGamificationData(), { wrapper });
    
    expect(result.current.data).toBeUndefined();
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
