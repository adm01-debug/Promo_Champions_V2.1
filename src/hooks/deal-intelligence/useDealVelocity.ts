import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { toast } from "sonner";
import type { VelocityStatus, ConfidenceTier } from "@/components/deal-intelligence/velocityHelpers";

export interface DealVelocityPrediction {
  id: string;
  sale_id: string;
  owner_id: string | null;
  predicted_close_date: string | null;
  predicted_days_remaining: number | null;
  confidence_score: number;
  confidence_tier: ConfidenceTier;
  velocity_status: VelocityStatus;
  current_stage: string | null;
  days_in_stage: number | null;
  expected_days_in_stage: number | null;
  stage_velocity_ratio: number | null;
  factors: { drivers: string[]; brakes: string[] };
  model_version: string;
  calculated_at: string;
}

export const useDealVelocityPrediction = (saleId: string | undefined) => {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["deal-velocity-prediction", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const { data, error } = await supabase
        .from("deal_velocity_predictions")
        .select("*")
        .eq("sale_id", saleId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as DealVelocityPrediction | null;
    },
    enabled: !!saleId,
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  useEffect(() => {
    if (!saleId) return;
    const ch = supabase
      .channel(`deal-velocity-${saleId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "deal_velocity_predictions", filter: `sale_id=eq.${saleId}` },
        () => qc.invalidateQueries({ queryKey: ["deal-velocity-prediction", saleId] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [saleId, qc]);

  return query;
};

export const useDealVelocityBatch = (filters?: { status?: VelocityStatus[]; ownerId?: string }) => {
  return useQuery({
    queryKey: ["deal-velocity-batch", filters],
    queryFn: async () => {
      let q = supabase
        .from("deal_velocity_predictions")
        .select("*, sales!inner(id, client_name, product_name, amount, status, salesperson_id)")
        .order("confidence_score", { ascending: false });
      if (filters?.status?.length) q = q.in("velocity_status", filters.status);
      if (filters?.ownerId) q = q.eq("owner_id", filters.ownerId);
      const { data, error } = await q.limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });
};

export const usePredictDealVelocity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { saleId?: string; batch?: boolean }) => {
      const body = input.batch ? { batch: true } : { sale_id: input.saleId };
      const { data, error } = await supabase.functions.invoke("predict-deal-velocity", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.batch ? "Previsões recalculadas" : "Previsão atualizada");
      qc.invalidateQueries({ queryKey: ["deal-velocity-prediction"] });
      qc.invalidateQueries({ queryKey: ["deal-velocity-batch"] });
    },
    onError: (err: Error) => {
      const msg = err?.message || "";
      if (msg.includes("429")) toast.error("Limite de requisições atingido");
      else if (msg.includes("402")) toast.error("Créditos de IA esgotados");
      else toast.error("Erro ao prever velocidade do deal");
    },
  });
};
