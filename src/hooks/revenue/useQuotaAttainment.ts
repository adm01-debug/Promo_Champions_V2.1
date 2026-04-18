import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RiskLevel = "safe" | "on_track" | "at_risk" | "critical";

export interface QuotaPrediction {
  id: string;
  salesperson_id: string;
  period_start: string;
  period_end: string;
  quota_amount: number;
  closed_amount: number;
  weighted_pipeline: number;
  predicted_amount: number;
  attainment_probability: number;
  scenario_pessimistic: number;
  scenario_realistic: number;
  scenario_optimistic: number;
  pace_required_per_day: number;
  current_pace_per_day: number;
  risk_level: RiskLevel;
  factors: Record<string, unknown>;
  calculated_at: string;
  salesperson?: { name: string } | null;
}

export interface QuotaAlert {
  id: string;
  prediction_id: string;
  salesperson_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  recommended_action: string | null;
  acknowledged: boolean;
  created_at: string;
}

export function useQuotaAttainmentPredictions() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["quota-attainment-predictions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quota_attainment_predictions")
        .select("*, salesperson:salespeople(name)")
        .order("calculated_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const seen = new Set<string>();
      const latest: QuotaPrediction[] = [];
      for (const row of (data ?? []) as QuotaPrediction[]) {
        if (seen.has(row.salesperson_id)) continue;
        seen.add(row.salesperson_id);
        latest.push(row);
      }
      return latest;
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("quota-predictions-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "quota_attainment_predictions" }, () => {
        qc.invalidateQueries({ queryKey: ["quota-attainment-predictions"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return query;
}

export function useQuotaAttainmentAlerts() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["quota-attainment-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quota_attainment_alerts")
        .select("*")
        .eq("acknowledged", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as QuotaAlert[];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("quota-alerts-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "quota_attainment_alerts" }, () => {
        qc.invalidateQueries({ queryKey: ["quota-attainment-alerts"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return query;
}

export function useRunQuotaPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { period?: "month" | "quarter"; salesperson_id?: string | null } = {}) => {
      const { data, error } = await supabase.functions.invoke("predict-quota-attainment", { body: input });
      if (error) throw error;
      return data as { predictions_count: number; alerts_count: number };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["quota-attainment-predictions"] });
      qc.invalidateQueries({ queryKey: ["quota-attainment-alerts"] });
      toast.success(`${d.predictions_count} predições · ${d.alerts_count} alertas`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAcknowledgeQuotaAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quota_attainment_alerts")
        .update({ acknowledged: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quota-attainment-alerts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
