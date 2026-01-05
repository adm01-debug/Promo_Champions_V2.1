import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useABCAnalysis } from '../useABCAnalysis';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useABCAnalysis', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useABCAnalysis(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
