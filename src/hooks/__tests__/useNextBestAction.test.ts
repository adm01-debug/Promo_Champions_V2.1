import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNextBestAction } from '../useNextBestAction';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useNextBestAction', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useNextBestAction(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
