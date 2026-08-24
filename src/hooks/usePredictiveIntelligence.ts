import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PredictiveSnapshot {
  forecast: {
    weighted_revenue: number;
    best_case: number;
    worst_case: number;
    confidence: number;
    horizon_days: number;
    deal_count: number;
  };
  pipeline_health: {
    healthy: number;
    at_risk: number;
    critical: number;
    avg_probability: number;
  };
  churn: {
    high_risk_count: number;
    medium_risk_count: number;
    total_revenue_at_risk: number;
    top_at_risk: Array<{ id: string; name: string; risk: number; reasons: string[] }>;
  };
  win_propensity: {
    high: number;
    medium: number;
    low: number;
    top_opportunities: Array<{ id: string; client: string; amount: number; probability: number }>;
  };
  trends: {
    velocity_change_pct: number;
    win_rate_30d: number;
    win_rate_90d: number;
    avg_deal_cycle_days: number;
  };
  ai_insights?: {
    summary: string;
    recommendations: string[];
    risks: string[];
  };
  generated_at: string;
}

interface Options {
  horizonDays?: number;
  includeAI?: boolean;
}

export function usePredictiveIntelligence(options: Options = {}) {
  const { horizonDays = 90, includeAI = true } = options;
  return useQuery({
    queryKey: ["predictive-intelligence", horizonDays, includeAI],
    queryFn: async (): Promise<PredictiveSnapshot> => {
      const { data, error } = await supabase.functions.invoke("predictive-intelligence", {
        body: { horizon_days: horizonDays, include_ai: includeAI },
      });
      if (error) throw error;
      return data as PredictiveSnapshot;
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
