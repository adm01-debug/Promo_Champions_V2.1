import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HealthFactor {
  label: string;
  status: "good" | "warning" | "bad";
  value: string;
}

export interface AccountHealth {
  account_id: string;
  account_name: string;
  tier: string;
  health_status: string;
  health_score: number;
  churn_risk: "low" | "medium" | "high" | "critical";
  expansion_potential: number;
  days_since_last_activity: number;
  total_revenue: number;
  recommended_action: string;
  health_factors?: HealthFactor[];
  engagement_radar?: {
    usage: number;
    sentiment: number;
    support: number;
    financial: number;
  };
}

export interface CustomerSuccessSummary {
  total_accounts: number;
  at_risk: number;
  critical: number;
  expansion_ready: number;
  total_revenue_at_risk: number;
  avg_health_score: number;
}

export function useCustomerSuccess() {
  return useQuery({
    queryKey: ["customer-success-hub"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{
        accounts: AccountHealth[];
        summary: CustomerSuccessSummary;
      }>("customer-success-hub", { body: {} });
      if (error) throw error;
      return data!;
    },
    staleTime: 5 * 60 * 1000,
  });
}
