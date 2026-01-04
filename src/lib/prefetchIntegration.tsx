import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function usePrefetch(queries: Array<{ key: string[]; fn: () => Promise<any> }>) {
  const queryClient = useQueryClient();

  useEffect(() => {
    queries.forEach(({ key, fn }) => {
      queryClient.prefetchQuery(key, fn);
    });
  }, []);
}

// Usage
export function DashboardLayout() {
  usePrefetch([
    { key: ['clients'], fn: () => fetchClients() },
    { key: ['deals'], fn: () => fetchDeals() }
  ]);

  return <Outlet />;
}
