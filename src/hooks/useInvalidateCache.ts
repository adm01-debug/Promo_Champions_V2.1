import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

// Define related query keys for intelligent invalidation
const QUERY_RELATIONSHIPS: Record<string, string[]> = {
  // Sales mutations affect these queries
  sales: [
    "sales",
    "sales-list",
    "pipeline-deals",
    "dashboard-kpis",
    "competitive-ranking",
    "sales-forecast",
    "funnel-data",
    "top-products",
    "sdr-metrics",
    "closer-metrics",
    "goals-dashboard",
    "win-loss-analysis",
  ],
  
  // Client mutations affect these
  clients: [
    "clients",
    "dashboard-kpis",
  ],
  
  // Product mutations affect these
  products: [
    "products",
    "top-products",
  ],
  
  // Task mutations affect these
  tasks: [
    "tasks",
    "next-best-action",
    "stagnant-tasks",
  ],
  
  // Activity mutations affect these
  activities: [
    "activities",
    "recent-activities",
    "activity-stats",
    "activity-goals",
    "sdr-metrics",
    "achievement-trends",
    "achievements",
  ],
  
  // Salesperson mutations affect these
  salespeople: [
    "salespeople",
    "competitive-ranking",
    "goals-dashboard",
    "sdr-metrics",
    "closer-metrics",
  ],
  
  // Goals mutations affect these
  goals: [
    "sales-goals",
    "goals-dashboard",
    "competitive-ranking",
  ],
  
  // Deal/Pipeline mutations affect these
  pipeline: [
    "pipeline-deals",
    "pipeline",
    "dashboard-kpis",
    "at-risk-deals",
    "deal-velocity",
    "funnel-data",
    "sales-forecast",
  ],
  
  // Achievement mutations
  achievements: [
    "achievements",
    "achievement-trends",
    "team-achievement-stats",
    "streak-ranking",
  ],
  
  // Cadence mutations
  cadences: [
    "cadences",
    "cadence-steps",
    "prospect-cadences",
    "cadence-tasks",
    "cadence-stats",
  ],
};

export function useInvalidateCache() {
  const queryClient = useQueryClient();

  // Invalidate all queries related to a domain
  const invalidateDomain = useCallback(
    (domain: keyof typeof QUERY_RELATIONSHIPS) => {
      const queryKeys = QUERY_RELATIONSHIPS[domain] || [domain];
      
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    [queryClient]
  );

  // Invalidate specific query keys
  const invalidateQueries = useCallback(
    (keys: string[]) => {
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    [queryClient]
  );

  // Invalidate all queries (use sparingly)
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  // Remove specific queries from cache entirely
  const removeQueries = useCallback(
    (keys: string[]) => {
      keys.forEach((key) => {
        queryClient.removeQueries({ queryKey: [key] });
      });
    },
    [queryClient]
  );

  // Reset specific queries to their initial state
  const resetQueries = useCallback(
    (keys: string[]) => {
      keys.forEach((key) => {
        queryClient.resetQueries({ queryKey: [key] });
      });
    },
    [queryClient]
  );

  return {
    invalidateDomain,
    invalidateQueries,
    invalidateAll,
    removeQueries,
    resetQueries,
  };
}

// Export relationships for testing/debugging
export { QUERY_RELATIONSHIPS };
