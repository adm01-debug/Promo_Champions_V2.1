import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ForecastCategory = "commit" | "best_case" | "pipeline" | "omitted" | "closed";

export interface ForecastRollupRow {
  category: ForecastCategory;
  deal_count: number;
  total_amount: number;
  weighted_amount: number;
}

export interface WinRateRow {
  segment: string;
  total_deals: number;
  won_deals: number;
  lost_deals: number;
  win_rate: number;
  avg_deal_size: number;
  total_revenue: number;
}

export interface InspectionDeal {
  id: string;
  sale_id: string;
  stage: string;
  days_in_stage: number;
  last_activity_at: string | null;
  days_since_activity: number | null;
  risk_flags: Array<{ flag: string; severity: string; days?: number }>;
  inspected_at: string;
}

export interface RevenueIntelligenceData {
  horizon_days: number;
  forecast_rollup: ForecastRollupRow[];
  variance: Record<string, number>;
  coverage: {
    ratio: number;
    target: number;
    weighted_pipeline: number;
    health_label: "excellent" | "healthy" | "warning" | "critical";
  };
  win_rate_breakdown: WinRateRow[];
  pipeline_inspection: {
    total_inspected: number;
    flag_counts: Record<string, number>;
    deals: InspectionDeal[];
  };
}

export function useRevenueIntelligenceHub(horizonDays = 90, dimension: "category" | "source" | "product" = "category") {
  return useQuery({
    queryKey: ["revenue-intelligence-hub", horizonDays, dimension],
    queryFn: async (): Promise<RevenueIntelligenceData> => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/revenue-intelligence?horizon=${horizonDays}&dimension=${dimension}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      if (!res.ok) throw new Error(`Revenue Intelligence error: ${res.status}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export interface BuyingCommitteeMember {
  id: string;
  sale_id: string;
  contact_name: string;
  contact_email: string | null;
  job_title: string | null;
  committee_role: "champion" | "decision_maker" | "influencer" | "blocker" | "user";
  influence_level: number;
  sentiment: "positive" | "neutral" | "negative";
  is_single_threaded: boolean;
  notes: string | null;
}

export function useBuyingCommittee(saleId?: string) {
  return useQuery({
    queryKey: ["buying-committee", saleId],
    queryFn: async () => {
      if (!saleId) return [];
      const { data, error } = await supabase
        .from("buying_committee_members")
        .select("*")
        .eq("sale_id", saleId)
        .order("influence_level", { ascending: false });
      if (error) throw error;
      return (data as BuyingCommitteeMember[]) ?? [];
    },
    enabled: !!saleId,
  });
}

export function useUpsertCommitteeMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: Partial<BuyingCommitteeMember> & { sale_id: string; contact_name: string }) => {
      if (m.id) {
        const { error } = await supabase.from("buying_committee_members").update(m).eq("id", m.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("buying_committee_members").insert(m);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["buying-committee", vars.sale_id] });
      toast.success("Membro salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCommitteeMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("buying_committee_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["buying-committee"] });
      toast.success("Removido");
    },
  });
}

export function useRunPipelineInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("compute_pipeline_inspection");
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["revenue-intelligence-hub"] });
      toast.success(`${count} deals inspecionados`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export interface QBRReport {
  id: string;
  period_label: string;
  period_start: string;
  period_end: string;
  salesperson_id: string | null;
  metrics: Record<string, unknown>;
  ai_narrative: string | null;
  recommendations: string[];
  generated_at: string;
}

export function useQBRReports() {
  return useQuery({
    queryKey: ["qbr-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qbr_reports")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data as QBRReport[]) ?? [];
    },
  });
}

export function useGenerateQBR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { period_label?: string; period_start?: string; period_end?: string; salesperson_id?: string }) => {
      const { data, error } = await supabase.functions.invoke("qbr-generator", { body: input });
      if (error) throw error;
      return data as QBRReport;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qbr-reports"] });
      toast.success("QBR gerado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
