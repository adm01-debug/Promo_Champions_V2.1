import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSalespersonCoaching } from '../useSalespersonCoaching';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useSalespersonCoaching', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useSalespersonCoaching(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
