import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDealProbability } from '../useDealProbability';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useDealProbability', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useDealProbability(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
