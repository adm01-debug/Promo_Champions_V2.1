import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDealVelocity } from '../useDealVelocity';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useDealVelocity', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useDealVelocity(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
