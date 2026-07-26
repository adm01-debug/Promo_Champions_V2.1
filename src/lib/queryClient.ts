import { QueryClient } from '@tanstack/react-query';

interface AppQueryError {
  status?: number;
  message?: string;
  name?: string;
}

// Singleton — importado por App.tsx e AuthContext.tsx para garantir
// a mesma instancia (necessario para queryClient.clear() funcionar).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        const err = error as AppQueryError;
        if (err?.status === 401 || err?.status === 403) return false;
        return failureCount < 2;
      },
      refetchInterval: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: (failureCount, error) => {
        const err = error as AppQueryError;
        const status = err?.status;
        const message = err?.message?.toLowerCase() || '';
        const isNetworkError =
          message.includes('network') ||
          message.includes('fetch') ||
          message.includes('timeout');
        const isServerError = status !== undefined && status >= 500 && status <= 599;
        if (failureCount < 2 && (isNetworkError || isServerError)) return true;
        return false;
      },
    },
  },
});
