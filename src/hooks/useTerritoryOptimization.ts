import { useQuery } from '@tanstack/react-query';
import { fetchWithUserToken } from '@/lib/edgeFetch';
import { SUPABASE_URL } from '@/integrations/supabase/env';

export type TerritoryHealth = 'excellent' | 'healthy' | 'warning' | 'critical';
export type TerritoryStatus =
  'healthy' | 'underserved' | 'overloaded' | 'stagnant' | 'unowned';
type RecommendationType = 'reassign' | 'split' | 'merge' | 'assign_owner' | 'rebalance';
export type RecommendationPriority = 'high' | 'medium' | 'low';

interface TerritoryKPIs {
  total_territories: number;
  healthy_count: number;
  underserved_count: number;
  overloaded_count: number;
  unowned_count: number;
  avg_coverage: number;
  balance_index: number;
  potential_revenue_lost: number;
}

interface TerritoryAnalysis {
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

interface SalespersonLoad {
  salesperson_id: string;
  salesperson_name: string;
  territories_count: number;
  total_revenue: number;
  total_deals: number;
  load_score: number;
}

interface TerritoryRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  territory_id: string | null;
  territory_name: string | null;
  message: string;
  expected_impact: string;
}

interface TerritoryOptimizationResponse {
  days: number;
  health: TerritoryHealth;
  kpis: TerritoryKPIs;
  territories: TerritoryAnalysis[];
  salesperson_loads: SalespersonLoad[];
  recommendations: TerritoryRecommendation[];
}

export function useTerritoryOptimization(days: 30 | 60 | 90 = 30) {
  return useQuery<TerritoryOptimizationResponse>({
    queryKey: ['territory-optimization', days],
    queryFn: async () => {
      const url = `${SUPABASE_URL}/functions/v1/territory-optimization?days=${days}`;
      const resp = await fetchWithUserToken(url, { method: 'GET' });
      if (!resp.ok) throw new Error(`Territory optimization failed: ${resp.status}`);
      return (await resp.json()) as TerritoryOptimizationResponse;
    },
    staleTime: 5 * 60 * 1000,
  });
}
