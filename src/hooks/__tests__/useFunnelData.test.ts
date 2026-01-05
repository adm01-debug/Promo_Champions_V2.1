import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFunnelData } from '../useFunnelData';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useFunnelData', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useFunnelData(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
