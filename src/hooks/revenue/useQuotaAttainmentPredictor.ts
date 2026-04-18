import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type QuotaRiskLevel = "safe" | "on_track" | "at_risk" | "critical";
export type QuotaActionType = "close_deal" | "generate_pipeline" | "increase_ticket" | "accelerate_stage";

export interface QuotaForecast {
  id: string;
  salesperson_id: string;
  period_start: string;
  period_end: string;
  quota: number;
  closed: number;
  weighted_open: number;
  pace_per_day: number;
  days_remaining: number;
  p10: number;
  p50: number;
  p90: number;
  attainment_probability: number;
  risk_level: QuotaRiskLevel;
  simulations: number;
  computed_at: string;
  salesperson?: { name: string } | null;
}

export interface QuotaAction {
  id: string;
  forecast_id: string;
  action_type: QuotaActionType;
  title: string;
  description: string | null;
  expected_impact: number;
  priority: number;
  created_at: string;
}

export function useQuotaForecasts() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["quota-attainment-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quota_attainment_forecasts")
        .select("*, salesperson:salespeople(name)")
        .order("computed_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const seen = new Set<string>();
      const latest: QuotaForecast[] = [];
      for (const row of (data ?? []) as QuotaForecast[]) {
        if (seen.has(row.salesperson_id)) continue;
        seen.add(row.salesperson_id);
        latest.push(row);
      }
      return latest;
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("quota-forecasts-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "quota_attainment_forecasts" }, () => {
        qc.invalidateQueries({ queryKey: ["quota-attainment-forecasts"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return query;
}

export function useQuotaActions(forecastIds?: string[]) {
  return useQuery({
    queryKey: ["quota-attainment-actions", forecastIds?.sort().join(",")],
    enabled: !!forecastIds && forecastIds.length > 0,
    queryFn: async () => {
      if (!forecastIds || forecastIds.length === 0) return [];
      const { data, error } = await supabase
        .from("quota_attainment_actions")
        .select("*")
        .in("forecast_id", forecastIds)
        .order("priority", { ascending: true });
      if (error) throw error;
      return (data ?? []) as QuotaAction[];
    },
  });
}

export function useQuotaForecastSummary() {
  const { data: forecasts = [] } = useQuotaForecasts();
  const total = forecasts.length;
  const safe = forecasts.filter((f) => f.risk_level === "safe").length;
  const critical = forecasts.filter((f) => f.risk_level === "critical").length;
  const gap = forecasts.reduce((s, f) => s + Math.max(0, f.quota - f.p50), 0);
  const avgProb = total > 0 ? forecasts.reduce((s, f) => s + f.attainment_probability, 0) / total : 0;
  return { total, safe, critical, gap, avgProb, safePct: total ? safe / total : 0, criticalPct: total ? critical / total : 0 };
}
