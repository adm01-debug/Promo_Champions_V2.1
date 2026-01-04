import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Cache strategies by data type
export const cacheStrategies = {
  static: { staleTime: Infinity, cacheTime: Infinity }, // Products, settings
  normal: { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 }, // Clients, deals
  realtime: { staleTime: 0, cacheTime: 0 } // Dashboard metrics
};

export function applyCacheStrategy(key: string, strategy: 'static' | 'normal' | 'realtime') {
  return {
    queryKey: [key],
    ...cacheStrategies[strategy]
  };
}
