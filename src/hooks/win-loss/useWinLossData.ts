import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  periodSinceISO,
  type WinLossFilterState,
} from "@/components/win-loss/winLossFiltersHelpers";

export interface WLAnalysisRow {
  id: string;
  sale_id: string;
  outcome: "won" | "lost";
  primary_reason: string | null;
  competitor: string | null;
  lost_stage: string | null;
  cycle_days: number | null;
  amount: number | null;
  segment: string | null;
  analyzed_at: string;
}

export const useFilteredWinLossAnalyses = (filters: WinLossFilterState) =>
  useQuery({
    queryKey: ["wl-analyses-filtered", filters],
    queryFn: async () => {
      let q = supabase
        .from("win_loss_analyses")
        .select("id,sale_id,outcome,primary_reason,competitor,lost_stage,cycle_days,amount,segment,analyzed_at")
        .gte("analyzed_at", periodSinceISO(filters.period))
        .order("analyzed_at", { ascending: false })
        .limit(2000);

      if (filters.segments.length) q = q.in("segment", filters.segments);
      if (filters.minAmount != null) q = q.gte("amount", filters.minAmount);
      if (filters.maxAmount != null) q = q.lte("amount", filters.maxAmount);

      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as unknown as WLAnalysisRow[];

      // Salesperson filter via sales join (small N — client filter to keep query simple)
      if (filters.salespersonIds.length && rows.length) {
        const { data: sales } = await supabase
          .from("sales")
          .select("id,salesperson_id")
          .in("id", rows.map(r => r.sale_id));
        const allow = new Set(
          (sales ?? [])
            .filter(s => filters.salespersonIds.includes(s.salesperson_id ?? ""))
            .map(s => s.id),
        );
        rows = rows.filter(r => allow.has(r.sale_id));
      }
      return rows;
    },
    staleTime: 30_000,
  });

export const useWinLossSegments = () =>
  useQuery({
    queryKey: ["wl-segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("win_loss_analyses")
        .select("segment")
        .not("segment", "is", null)
        .limit(500);
      if (error) throw error;
      return Array.from(new Set((data ?? []).map(r => r.segment as string))).sort();
    },
    staleTime: 5 * 60_000,
  });

export const useActiveSalespeople = () =>
  useQuery({
    queryKey: ["wl-salespeople"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople_public")
        .select("id,name")
        .order("name");
      if (error) throw error;
      return (data ?? []) as { id: string; name: string }[];
    },
    staleTime: 5 * 60_000,
  });
