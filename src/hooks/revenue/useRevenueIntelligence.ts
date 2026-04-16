import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DealHealth {
  health_score: number;
  health_label: "critical" | "at_risk" | "healthy" | "excellent";
  positive_factors: Array<{ factor: string; impact: number; label: string }>;
  negative_factors: Array<{ factor: string; impact: number; label: string }>;
}

export interface RevenueForecast {
  period: string;
  weighted_revenue: number;
  raw_pipeline: number;
  deal_count: number;
  avg_health: number;
}

export interface RiskSignal {
  id: string;
  sale_id: string;
  signal_type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detected_at: string;
  resolved_at: string | null;
}

export function useDealHealth(saleId?: string) {
  return useQuery({
    queryKey: ["deal-health", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const { data, error } = await supabase.rpc("calculate_deal_health", { _sale_id: saleId });
      if (error) throw error;
      return (data?.[0] as DealHealth) ?? null;
    },
    enabled: !!saleId,
    staleTime: 60_000,
  });
}

export function useRevenueForecast(days: number = 90) {
  return useQuery({
    queryKey: ["revenue-forecast", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_revenue_forecast", { _days: days });
      if (error) throw error;
      return (data as RevenueForecast[]) ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useRiskSignals(saleId?: string) {
  return useQuery({
    queryKey: ["risk-signals", saleId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("deal_risk_signals")
        .select("*")
        .is("resolved_at", null)
        .order("detected_at", { ascending: false })
        .limit(50);
      if (saleId) q = q.eq("sale_id", saleId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as RiskSignal[]) ?? [];
    },
  });
}

export function useResolveRiskSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: sp } = await supabase.rpc("get_current_salesperson_id");
      const { error } = await supabase
        .from("deal_risk_signals")
        .update({ resolved_at: new Date().toISOString(), resolved_by: sp as string })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-signals"] });
      toast.success("Sinal resolvido!");
    },
  });
}

export function usePersistHealthSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { sale_id: string; health: DealHealth; recommendation?: string }) => {
      const { error } = await supabase.from("deal_health_scores").insert({
        sale_id: input.sale_id,
        health_score: input.health.health_score,
        health_label: input.health.health_label,
        positive_factors: input.health.positive_factors,
        negative_factors: input.health.negative_factors,
        ai_recommendation: input.recommendation ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deal-health"] });
      toast.success("Snapshot de saúde salvo");
    },
  });
}
