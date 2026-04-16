import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RevOpsKPIs {
  total_pipeline: number;
  weighted_forecast: number;
  closed_revenue: number;
  win_rate: number;
  avg_deal_size: number;
  cycle_days: number;
  velocity: number;
  coverage_ratio: number;
  activity_efficiency: number;
  earned_commissions: number;
  pending_commissions: number;
}

export interface RevOpsData {
  horizon_days: number;
  kpis: RevOpsKPIs;
  health: {
    label: "excellent" | "healthy" | "warning" | "critical";
    coverage_ratio: number;
    recommendation: string;
  };
  stage_distribution: Record<string, { count: number; value: number }>;
  deal_counts: { open: number; won: number; lost: number };
}

export function useRevOpsHub(horizonDays = 90) {
  return useQuery({
    queryKey: ["revops-hub", horizonDays],
    queryFn: async (): Promise<RevOpsData> => {
      const session = await supabase.auth.getSession();
      const token =
        session.data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/revops-hub?horizon=${horizonDays}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      if (!res.ok) throw new Error(`RevOps Hub error: ${res.status}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
