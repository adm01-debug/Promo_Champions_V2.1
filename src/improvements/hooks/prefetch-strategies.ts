// src/hooks/usePrefetch.ts
// Estratégias de Prefetch otimizadas
// Data: 2024-12-28

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { QUERY_KEYS } from '@/lib/cache-config';

// ============================================================================
// PREFETCH HOOKS
// ============================================================================

/**
 * Prefetch de deal ao hover
 */
export const usePrefetchDeal = () => {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout>();

  return {
    onMouseEnter: (dealId: string) => {
      timeoutRef.current = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.dealDetail(dealId),
          staleTime: 1000 * 60 * 5,
        });
      }, 200); // Delay de 200ms
    },
    onMouseLeave: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
  };
};

/**
 * Prefetch de client ao hover
 */
export const usePrefetchClient = () => {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout>();

  return {
    onMouseEnter: (clientId: string) => {
      timeoutRef.current = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.clientDetail(clientId),
          staleTime: 1000 * 60 * 10,
        });
      }, 200);
    },
    onMouseLeave: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
  };
};

/**
 * Prefetch de próxima página
 */
export const usePrefetchNextPage = (
  currentPage: number,
  hasNextPage: boolean,
  queryKeyBase: readonly unknown[]
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (hasNextPage) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: [...queryKeyBase, nextPage],
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [currentPage, hasNextPage, queryClient, queryKeyBase]);
};

/**
 * Prefetch on route change
 */
export const usePrefetchRoute = () => {
  const queryClient = useQueryClient();

  return (route: string) => {
    const prefetchMap: Record<string, () => void> = {
      '/dashboard': () => {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.dashboardKPIs(),
        });
      },
      '/pipeline': () => {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.pipeline(),
        });
      },
      '/clients': () => {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.clientsList(),
        });
      },
      '/analytics': () => {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.salesMetrics('month'),
        });
      },
    };

    prefetchMap[route]?.();
  };
};

// ============================================================================
// INTERSECTION OBSERVER PREFETCH
// ============================================================================

/**
 * Prefetch quando elemento está próximo de aparecer
 */
export const useIntersectionPrefetch = (
  queryKey: readonly unknown[],
  enabled = true
) => {
  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver>();

  const setupObserver = (element: HTMLElement | null) => {
    if (!element || !enabled) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            queryClient.prefetchQuery({ queryKey });
          }
        });
      },
      {
        rootMargin: '200px', // Prefetch 200px antes
      }
    );

    observerRef.current.observe(element);
  };

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return setupObserver;
};

// ============================================================================
// BATCH PREFETCH
// ============================================================================

/**
 * Prefetch múltiplos recursos de uma vez
 */
export const useBatchPrefetch = () => {
  const queryClient = useQueryClient();

  return async (queries: Array<{ queryKey: readonly unknown[] }>) => {
    await Promise.all(
      queries.map((query) =>
        queryClient.prefetchQuery({
          queryKey: query.queryKey,
          staleTime: 1000 * 60 * 5,
        })
      )
    );
  };
};

// ============================================================================
// INTELLIGENT PREFETCH
// ============================================================================

/**
 * Prefetch baseado em padrões de uso
 */
export const useIntelligentPrefetch = () => {
  const queryClient = useQueryClient();

  // Analisar histórico de navegação
  const analyzeUsagePatterns = () => {
    const history = JSON.parse(
      localStorage.getItem('route_history') || '[]'
    ) as string[];

    // Encontrar rotas mais visitadas após a atual
    const currentRoute = window.location.pathname;
    const nextRoutes = history.reduce((acc, route, i) => {
      if (history[i - 1] === currentRoute) {
        acc[route] = (acc[route] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Prefetch as 3 rotas mais prováveis
    const topRoutes = Object.entries(nextRoutes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([route]) => route);

    return topRoutes;
  };

  return { analyzeUsagePatterns };
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// 1. Prefetch on hover
const DealCard = ({ deal }) => {
  const prefetch = usePrefetchDeal();
  
  return (
    <Card
      {...prefetch.onMouseEnter(deal.id)}
      {...prefetch.onMouseLeave()}
    >
      {deal.title}
    </Card>
  );
};

// 2. Prefetch next page
const PaginatedList = ({ page, hasNext }) => {
  usePrefetchNextPage(page, hasNext, ['items']);
  
  return <List />;
};

// 3. Intersection prefetch
const LazySection = () => {
  const setupPrefetch = useIntersectionPrefetch(['section-data']);
  
  return <div ref={setupPrefetch}>...</div>;
};
*/
