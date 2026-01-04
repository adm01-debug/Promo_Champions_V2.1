import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNextBestAction } from '../useNextBestAction';

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

describe('useNextBestAction', () => {
  it('should return data successfully', async () => {
    const { result } = renderHook(() => useNextBestAction('test-id'), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useNextBestAction('test-id'), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });
});
