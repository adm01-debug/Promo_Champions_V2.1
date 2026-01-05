import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeadScoring } from '../useLeadScoring';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useLeadScoring', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useLeadScoring(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
