import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImpactRow {
  session_id: string;
  salesperson_id: string;
  coach_id: string;
  completed_at: string;
  focus_skills: string[] | null;
  outcome_rating: number | null;
  pre_avg_overall: number;
  post_avg_overall: number;
  delta_overall: number;
  pre_conversion: number;
  post_conversion: number;
  delta_conversion: number;
  pre_ticket: number;
  post_ticket: number;
  delta_ticket: number;
}

export interface CoachingImpactResponse {
  summary: {
    total_sessions: number;
    avg_delta_overall: number;
    avg_delta_conversion: number;
    avg_delta_ticket: number;
    roi_estimate: number;
  };
  top_sessions: ImpactRow[];
  skill_impact: Array<{ skill: string; avg_delta: number; sessions: number }>;
  timeline: Array<{ month: string; avg_delta: number; sessions: number }>;
  rows: ImpactRow[];
}

export const useCoachingImpact = () => {
  return useQuery<CoachingImpactResponse>({
    queryKey: ["coaching-impact"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("coaching-impact-summary", { body: {} });
      if (error) throw error;
      return data as CoachingImpactResponse;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
