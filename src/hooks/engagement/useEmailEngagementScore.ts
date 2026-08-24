import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EngagementTier } from "@/components/engagement/EmailScore/engagementScoreHelpers";

export interface EmailEngagementScore {
  id: string;
  sale_id: string;
  score: number;
  tier: EngagementTier;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  avg_response_minutes: number | null;
  recency_days: number | null;
  total_sent: number;
  total_opens: number;
  total_clicks: number;
  total_replies: number;
  last_calculated_at: string;
}

export interface EngagementHistoryPoint {
  captured_at: string;
  score: number;
  tier: EngagementTier;
}

export interface EngagementLeaderboardEntry {
  sale_id: string;
  client_name: string | null;
  score: number;
  tier: EngagementTier;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  total_sent: number;
  recency_days: number | null;
  salesperson_id: string | null;
}

export function useEmailEngagementScore(saleId?: string) {
  return useQuery({
    queryKey: ["email-engagement-score", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const { data, error } = await supabase
        .from("email_engagement_scores")
        .select("*")
        .eq("sale_id", saleId)
        .maybeSingle();
      if (error) throw error;
      return data as EmailEngagementScore | null;
    },
    enabled: Boolean(saleId),
    staleTime: 60_000,
  });
}

export function useEngagementScoreHistory(saleId?: string, days = 30) {
  return useQuery({
    queryKey: ["email-engagement-history", saleId, days],
    queryFn: async () => {
      if (!saleId) return [];
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("email_engagement_score_history")
        .select("captured_at, score, tier")
        .eq("sale_id", saleId)
        .gte("captured_at", since)
        .order("captured_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EngagementHistoryPoint[];
    },
    enabled: Boolean(saleId),
    staleTime: 60_000,
  });
}

export function useEmailEngagementLeaderboard(limit = 20) {
  return useQuery({
    queryKey: ["email-engagement-leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_engagement_leaderboard", { _limit: limit });
      if (error) throw error;
      return (data ?? []) as EngagementLeaderboardEntry[];
    },
    staleTime: 120_000,
  });
}

export function useRecomputeEngagementScores() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params?: { sale_ids?: string[]; recompute_all?: boolean }) => {
      const { data, error } = await supabase.functions.invoke("email-engagement-scorer", {
        body: params ?? { recompute_all: true },
      });
      if (error) throw error;
      return data as { ok: boolean; updated: number; by_tier: Record<EngagementTier, number> };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["email-engagement-score"] });
      qc.invalidateQueries({ queryKey: ["email-engagement-leaderboard"] });
      toast.success(`Engajamento recalculado: ${res.updated} contatos`);
    },
    onError: (e: Error) => toast.error(`Falha ao recalcular: ${e.message}`),
  });
}
