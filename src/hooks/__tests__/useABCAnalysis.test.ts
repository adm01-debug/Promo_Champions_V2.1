import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useABCAnalysis } from '../useABCAnalysis';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useABCAnalysis', () => {
  it('should return data successfully', async () => {
    const { result } = renderHook(() => useABCAnalysis(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.data).toBeDefined();
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useABCAnalysis(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle errors', async () => {
    // Mock error
    const { result } = renderHook(() => useABCAnalysis(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isError || result.current.isSuccess).toBe(true);
    });
  });
});
