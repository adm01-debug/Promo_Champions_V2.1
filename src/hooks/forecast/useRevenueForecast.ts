import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ForecastHorizon } from "@/components/forecast/forecastHelpers";

export interface RevenueForecastResponse {
  horizon_days: number;
  scenarios: { pessimistic: number; realistic: number; optimistic: number };
  confidence: number;
  metrics: {
    total_open_pipeline: number;
    weighted_forecast: number;
    open_deals_count: number;
    avg_cycle_days: number;
    won_amount_90d: number;
    won_count_90d: number;
    monthly_goal: number;
    goal_for_horizon: number;
    gap_to_goal: number;
    categories: {
      commit: number;
      best_case: number;
      pipeline: number;
    };
  };
  per_owner: Array<{
    salesperson_id: string | null;
    total_open_pipeline: number;
    weighted_forecast: number;
    open_deals_count: number;
    avg_cycle_days: number;
    monthly_goal: number;
    pessimistic_30d: number;
    realistic_30d: number;
    optimistic_30d: number;
  }>;
  narrative: string;
  risks: string[];
  opportunities: string[];
  accuracy?: {
    avg_deviation: number;
    last_period_accuracy: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  generated_at: string;
}

interface Options {
  horizonDays?: ForecastHorizon;
  ownerId?: string | null;
  includeAI?: boolean;
}

export function useRevenueForecast(options: Options = {}) {
  const { horizonDays = 30, ownerId = null, includeAI = true } = options;
  return useQuery({
    queryKey: ["revenue-forecast-ai", horizonDays, ownerId, includeAI],
    queryFn: async (): Promise<RevenueForecastResponse> => {
      const { data, error } = await supabase.functions.invoke("revenue-forecast-ai", {
        body: { horizon_days: horizonDays, owner_id: ownerId, include_ai: includeAI },
      });
      if (error) throw error;
      return data as RevenueForecastResponse;
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
