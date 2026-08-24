import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeatmapCell {
  client_id: string;
  client_name: string;
  month_start: string;
  salesperson_id: string | null;
  salesperson_name: string | null;
  is_current_user: boolean;
  deal_count: number;
  revenue: number;
  won_count: number;
}

export interface PurchaseIntelligence {
  client_id: string;
  client_name: string;
  total_purchases: number;
  total_revenue: number;
  avg_ticket: number;
  avg_cycle_days: number;
  last_purchase_date: string | null;
  days_since_last_purchase: number | null;
  share_with_me_pct: number;
  share_with_others_pct: number;
  top_competitor_internal: {
    salesperson_id: string | null;
    salesperson_name: string | null;
    revenue: number;
    deal_count: number;
  } | null;
  predicted_next_purchase_date: string | null;
  ai_prediction?: {
    predicted_next_purchase_date: string;
    predicted_amount: number;
    confidence: number;
    churn_risk_score: number;
    risk_reasons: string[];
    recommended_action: string;
    best_contact_window: "morning" | "afternoon" | "evening";
    pattern_insight: string;
  } | null;
  ai_error?: string;
  computed_at: string;
}

export function usePurchaseHeatmap(clientId?: string, months = 24) {
  return useQuery({
    queryKey: ["purchase-heatmap", clientId ?? "all", months],
    queryFn: async (): Promise<HeatmapCell[]> => {
      const { data, error } = await supabase.rpc("get_client_purchase_heatmap", {
        _client_id: clientId,
        _months: months,
      });
      if (error) throw error;
      return (data ?? []) as HeatmapCell[];
    },
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });
}

export function usePurchaseIntelligence(clientId?: string, withAI = true) {
  return useQuery({
    queryKey: ["purchase-intelligence", clientId, withAI],
    queryFn: async (): Promise<PurchaseIntelligence | null> => {
      if (!clientId) return null;
      if (withAI) {
        const { data, error } = await supabase.functions.invoke("purchase-intelligence-forecast", {
          body: { client_id: clientId },
        });
        if (error) throw error;
        return data as PurchaseIntelligence;
      }
      const { data, error } = await supabase.rpc("get_purchase_intelligence_summary", {
        _client_id: clientId,
      });
      if (error) throw error;
      return data as unknown as PurchaseIntelligence;
    },
    enabled: !!clientId,
    staleTime: 4 * 60 * 60_000, // 4h
    gcTime: 6 * 60 * 60_000,
  });
}

export interface SeasonalityCell {
  client_id: string;
  client_name: string;
  month_of_year: number;
  day_of_week: number;
  deal_count: number;
  avg_revenue: number;
  total_revenue: number;
}

export function useGlobalSeasonality() {
  return useQuery({
    queryKey: ["purchase-seasonality"],
    queryFn: async (): Promise<SeasonalityCell[]> => {
      const { data, error } = await supabase
        .from("client_purchase_seasonality" as never)
        .select("*");
      if (error) throw error;
      return (data ?? []) as unknown as SeasonalityCell[];
    },
    staleTime: 30 * 60_000,
  });
}
