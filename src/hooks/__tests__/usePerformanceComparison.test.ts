import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePerformanceComparison } from '../usePerformanceComparison';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('usePerformanceComparison', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => usePerformanceComparison(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
