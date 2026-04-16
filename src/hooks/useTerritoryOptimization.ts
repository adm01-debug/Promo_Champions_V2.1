import { useQuery } from "@tanstack/react-query";

export type TerritoryHealth = "excellent" | "healthy" | "warning" | "critical";
export type TerritoryStatus = "healthy" | "underserved" | "overloaded" | "stagnant" | "unowned";
export type RecommendationType = "reassign" | "split" | "merge" | "assign_owner" | "rebalance";
export type RecommendationPriority = "high" | "medium" | "low";

export interface TerritoryKPIs {
  total_territories: number;
  healthy_count: number;
  underserved_count: number;
  overloaded_count: number;
  unowned_count: number;
  avg_coverage: number;
  balance_index: number;
  potential_revenue_lost: number;
}

export interface TerritoryAnalysis {
  id: string;
  territory_name: string;
  territory_type: string;
  owner_id: string | null;
  owner_name: string | null;
  is_contested: boolean;
  total_deals: number;
  total_revenue: number;
  recent_revenue: number;
  recent_deals: number;
  potential_revenue: number;
  coverage_score: number;
  status: TerritoryStatus;
}

export interface SalespersonLoad {
  salesperson_id: string;
  salesperson_name: string;
  territories_count: number;
  total_revenue: number;
  total_deals: number;
  load_score: number;
}

export interface TerritoryRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  territory_id: string | null;
  territory_name: string | null;
  message: string;
  expected_impact: string;
}

export interface TerritoryOptimizationResponse {
  days: number;
  health: TerritoryHealth;
  kpis: TerritoryKPIs;
  territories: TerritoryAnalysis[];
  salesperson_loads: SalespersonLoad[];
  recommendations: TerritoryRecommendation[];
}

export function useTerritoryOptimization(days: 30 | 60 | 90 = 30) {
  return useQuery<TerritoryOptimizationResponse>({
    queryKey: ["territory-optimization", days],
    queryFn: async () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/territory-optimization?days=${days}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      if (!resp.ok) throw new Error(`Territory optimization failed: ${resp.status}`);
      return (await resp.json()) as TerritoryOptimizationResponse;
    },
    staleTime: 5 * 60 * 1000,
  });
}
