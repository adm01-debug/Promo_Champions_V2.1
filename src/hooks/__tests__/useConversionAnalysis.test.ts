import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConversionAnalysis } from '../useConversionAnalysis';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useConversionAnalysis', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useConversionAnalysis(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
