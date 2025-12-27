import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSuppliers } from '../useSuppliers';
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

describe('useSuppliers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch suppliers successfully', async () => {
    const mockSuppliers = [
      {
        id: '1',
        name: 'Fornecedor A',
        contact_name: 'João Silva',
        email: 'joao@fornecedora.com',
        phone: '+55 11 98765-4321',
        created_at: '2024-01-01',
        updated_at: '2024-01-15',
      },
      {
        id: '2',
        name: 'Fornecedor B',
        contact_name: 'Maria Santos',
        email: 'maria@fornecedorb.com',
        phone: '+55 21 91234-5678',
        created_at: '2024-01-02',
        updated_at: '2024-01-16',
      },
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ 
          data: mockSuppliers, 
          error: null 
        }),
      }),
    });

    const { result } = renderHook(() => useSuppliers(), { wrapper });
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.data).toEqual(mockSuppliers);
    expect(result.current.data).toHaveLength(2);
    expect(mockFrom).toHaveBeenCalledWith('suppliers');
  });

  it('should handle empty suppliers list', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ 
          data: [], 
          error: null 
        }),
      }),
    });

    const { result } = renderHook(() => useSuppliers(), { wrapper });
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.data).toEqual([]);
    expect(result.current.data).toHaveLength(0);
  });

  it('should handle database errors', async () => {
    const mockError = new Error('Connection failed');

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: mockError 
        }),
      }),
    });

    const { result } = renderHook(() => useSuppliers(), { wrapper });
    
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });
});
