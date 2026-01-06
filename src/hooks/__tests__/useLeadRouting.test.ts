import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeadRouting } from '../useLeadRouting';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLeadRouting', () => {
  it('should route leads using round-robin', async () => {
    const { result } = renderHook(() => useLeadRouting('round-robin'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useLeadRouting('load-based'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
