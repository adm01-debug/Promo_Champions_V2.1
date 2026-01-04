import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Cache strategies
export const cacheStrategies = {
  // Dados que mudam raramente (ex: configurações)
  static: {
    staleTime: 30 * 60 * 1000, // 30 min
    cacheTime: 60 * 60 * 1000, // 1 hora
  },
  
  // Dados que mudam frequentemente (ex: notificações)
  dynamic: {
    staleTime: 30 * 1000, // 30 segundos
    cacheTime: 2 * 60 * 1000, // 2 min
  },
  
  // Dados que precisam estar sempre atualizados (ex: saldo)
  realtime: {
    staleTime: 0,
    cacheTime: 0,
  },
};
