import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { toast } from "sonner";

export type HealthTier = "healthy" | "watch" | "at_risk" | "critical";

export interface DealHealthFactor {
  key: string;
  label: string;
  impact: number;
  weight: number;
}

export interface DealHealthAction {
  title: string;
  priority: "low" | "medium" | "high";
}

export interface DealHealthScore {
  id: string;
  sale_id: string;
  owner_id: string | null;
  health_score: number;
  tier: HealthTier;
  factors: DealHealthFactor[];
  recommended_actions: DealHealthAction[];
  ai_recommendation: string | null;
  last_activity_at: string | null;
  days_in_stage: number | null;
  calculated_at: string;
  computed_at: string;
}

export interface DealHealthHistoryEntry {
  id: string;
  sale_id: string;
  score: number;
  tier: HealthTier;
  delta: number;
  snapshot_at: string;
}

export const useDealHealth = (saleId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["deal-health", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const { data, error } = await supabase
        .from("deal_health_scores")
        .select("*")
        .eq("sale_id", saleId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as DealHealthScore | null;
    },
    enabled: !!saleId,
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  useEffect(() => {
    if (!saleId) return;
    const channel = supabase
      .channel(`deal-health-${saleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "deal_health_scores", filter: `sale_id=eq.${saleId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["deal-health", saleId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [saleId, queryClient]);

  return query;
};

export const useDealHealthBatch = (filters?: { tiers?: HealthTier[]; ownerId?: string }) => {
  return useQuery({
    queryKey: ["deal-health-batch", filters],
    queryFn: async () => {
      let q = supabase
        .from("deal_health_scores")
        .select("*, sales!inner(id, client_name, product_name, amount, status, salesperson_id)")
        .order("health_score", { ascending: true });
      if (filters?.tiers?.length) q = q.in("tier", filters.tiers);
      if (filters?.ownerId) q = q.eq("owner_id", filters.ownerId);
      const { data, error } = await q.limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });
};

export const useDealHealthHistory = (saleId: string | undefined) => {
  return useQuery({
    queryKey: ["deal-health-history", saleId],
    queryFn: async () => {
      if (!saleId) return [];
      const { data, error } = await supabase
        .from("deal_health_history")
        .select("*")
        .eq("sale_id", saleId)
        .order("snapshot_at", { ascending: true })
        .limit(30);
      if (error) throw error;
      return (data || []) as unknown as DealHealthHistoryEntry[];
    },
    enabled: !!saleId,
    staleTime: CACHE_TIMES.STALE_TIME,
  });
};

export const useRecalculateDealHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { saleId?: string; batch?: boolean }) => {
      const body = input.saleId ? { sale_id: input.saleId } : { batch: true };
      const { data, error } = await supabase.functions.invoke("calculate-deal-health", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.batch ? "Saúde dos deals recalculada" : "Saúde do deal recalculada");
      queryClient.invalidateQueries({ queryKey: ["deal-health"] });
      queryClient.invalidateQueries({ queryKey: ["deal-health-batch"] });
    },
    onError: (err: Error) => {
      const msg = err?.message || "";
      if (msg.includes("429")) toast.error("Limite de requisições atingido");
      else if (msg.includes("402")) toast.error("Créditos de IA esgotados");
      else toast.error("Erro ao recalcular saúde do deal");
    },
  });
};
