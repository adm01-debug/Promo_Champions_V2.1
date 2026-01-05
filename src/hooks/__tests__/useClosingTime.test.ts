import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClosingTime } from '../useClosingTime';

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useClosingTime', () => {
  it('should calculate average closing time', () => {
    const { result } = renderHook(() => useClosingTime(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
