import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSuppliers } from '../useSuppliers';
import React, { type ReactNode } from 'react';

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { 
    from: (...args: unknown[]) => mockFrom(...args) 
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
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

describe('useSuppliers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ 
          data: [], 
          error: null 
        }),
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      }),
    });
  });

  it('should return suppliers data structure', () => {
    const { result } = renderHook(() => useSuppliers(), { wrapper });
    
    expect(result.current.suppliers).toEqual([]);
    expect(result.current.suppliersLoading).toBeDefined();
  });

  it('should have mutation functions', () => {
    const { result } = renderHook(() => useSuppliers(), { wrapper });
    
    expect(result.current.createSupplier).toBeDefined();
    expect(result.current.updateSupplier).toBeDefined();
    expect(result.current.deleteSupplier).toBeDefined();
  });

  it('should have helper functions', () => {
    const { result } = renderHook(() => useSuppliers(), { wrapper });
    
    expect(result.current.getBestSupplier).toBeDefined();
    expect(typeof result.current.getBestSupplier).toBe('function');
  });
});
