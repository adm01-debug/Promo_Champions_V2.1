import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EngagementTier = "cold" | "warm" | "hot" | "on_fire";
export type ContactType = "lead" | "client";

export interface EngagementScore {
  id: string;
  contact_id: string;
  contact_type: ContactType;
  score: number;
  tier: EngagementTier;
  total_opens: number;
  total_clicks: number;
  total_replies: number;
  last_signal_at: string | null;
  updated_at: string;
}

export interface EngagementHistoryPoint {
  captured_at: string;
  score: number;
  tier: EngagementTier;
}

export interface EngagementLeaderboardEntry {
  id: string;
  contact_id: string;
  contact_type: ContactType;
  contact_name: string | null;
  score: number;
  tier: EngagementTier;
  total_opens: number;
  total_clicks: number;
  total_replies: number;
  last_signal_at: string | null;
  owner_salesperson_id: string | null;
}

export function useEngagementScore(contactId?: string, contactType?: ContactType) {
  return useQuery({
    queryKey: ["engagement-score", contactId, contactType],
    queryFn: async () => {
      if (!contactId || !contactType) return null;

      const [scoreRes, historyRes] = await Promise.all([
        supabase
          .from("contact_engagement_score")
          .select("*")
          .eq("contact_id", contactId)
          .eq("contact_type", contactType)
          .maybeSingle(),
        supabase
          .from("engagement_score_history")
          .select("captured_at, score, tier")
          .eq("contact_id", contactId)
          .eq("contact_type", contactType)
          .gte("captured_at", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
          .order("captured_at", { ascending: true }),
      ]);

      return {
        score: (scoreRes.data as EngagementScore | null) ?? null,
        history: (historyRes.data as EngagementHistoryPoint[] | null) ?? [],
      };
    },
    enabled: Boolean(contactId && contactType),
    staleTime: 60_000,
  });
}

export function useEngagementLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ["engagement-leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("engagement_score_leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as EngagementLeaderboardEntry[];
    },
    staleTime: 120_000,
  });
}

export function useRecomputeEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params?: { contactId?: string; contactType?: ContactType }) => {
      if (params?.contactId && params?.contactType) {
        const { data, error } = await supabase.rpc("recompute_engagement_score", {
          _contact_id: params.contactId,
          _contact_type: params.contactType,
        });
        if (error) throw error;
        return { score: data as number };
      }
      const { data, error } = await supabase.functions.invoke("engagement-score-recompute", {
        body: {},
      });
      if (error) throw error;
      return data as { ok: boolean; updated: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["engagement-score"] });
      qc.invalidateQueries({ queryKey: ["engagement-leaderboard"] });
      toast.success("Engajamento recalculado");
    },
    onError: (e: Error) => toast.error(`Falha ao recalcular: ${e.message}`),
  });
}
