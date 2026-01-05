import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChurnPrediction } from '../useChurnPrediction';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useChurnPrediction', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useChurnPrediction(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
