import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CoachingTarget {
  salesperson_id: string;
  name: string;
  avatar_url: string | null;
  win_rate: number;
  deals_count: number;
  total_revenue: number;
  avg_deal_size: number;
  activities_30d: number;
  health_score: number;
  priority: "critical" | "warning" | "healthy";
  top_issue: string;
  recommended_action: string;
}

export interface CoachingSummary {
  total: number;
  critical: number;
  warning: number;
  healthy: number;
  avg_health_score: number;
}

interface CoachingIntelligenceResponse {
  targets: CoachingTarget[];
  summary: CoachingSummary;
}

export const useCoachingIntelligence = () => {
  return useQuery<CoachingIntelligenceResponse>({
    queryKey: ["coaching-intelligence"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("coaching-intelligence", { body: {} });
      if (error) throw error;
      return data as CoachingIntelligenceResponse;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
