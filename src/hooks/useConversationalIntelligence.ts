import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CIRecording {
  id: string;
  title: string;
  duration_seconds: number;
  recorded_at: string;
  status: string;
  salesperson_id: string;
  sentiment_label: string | null;
  sentiment_score: number | null;
  talk_ratio_salesperson: number | null;
  talk_ratio_client: number | null;
  questions_asked: number | null;
  summary: string | null;
  objections_count: number;
  next_steps_count: number;
  has_insights: boolean;
  key_topics?: string[];
}

export interface CIData {
  horizon_days: number;
  kpis: {
    total_calls: number;
    analyzed_calls: number;
    total_duration_minutes: number;
    avg_duration_minutes: number;
    avg_sentiment: number;
    avg_talk_ratio_salesperson: number;
    avg_questions_per_call: number;
    coverage_percent: number;
  };
  sentiment_distribution: { positive: number; neutral: number; negative: number };
  top_objections: { label: string; count: number }[];
  top_topics: { label: string; count: number }[];
  recordings: CIRecording[];
}

export function useConversationalIntelligence(days = 30) {
  return useQuery({
    queryKey: ["conversational-intelligence", days],
    queryFn: async (): Promise<CIData> => {
      const session = await supabase.auth.getSession();
      const token =
        session.data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/conversational-intelligence?days=${days}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      if (!res.ok) throw new Error(`Conversational Intelligence error: ${res.status}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
