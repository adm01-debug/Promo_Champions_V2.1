import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WLAnalysisRow } from "./useWinLossData";

export interface CohortCell {
  createdMonth: string; // YYYY-MM (lead created)
  closedMonth: string;  // YYYY-MM (analyzed)
  total: number;
  wins: number;
  winRate: number;
}

const monthKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/**
 * Build cohort matrix: rows = lead-creation month, cols = closing month.
 * Joins win_loss_analyses with sales.created_at to get the cohort vintage.
 */
export const useWinLossCohort = (rows: WLAnalysisRow[]) => {
  const ids = useMemo(() => rows.map(r => r.sale_id), [rows]);

  const { data: salesCreated = {} } = useQuery({
    queryKey: ["wl-cohort-sales", ids.sort().join(",")],
    enabled: ids.length > 0,
    queryFn: async (): Promise<Record<string, string>> => {
      const { data } = await supabase.from("sales").select("id, created_at").in("id", ids);
      const map: Record<string, string> = {};
      ((data as Array<{ id: string; created_at: string }> | null) ?? []).forEach(s => {
        map[s.id] = s.created_at;
      });
      return map;
    },
    staleTime: 60_000,
  });

  return useMemo(() => {
    const grouped = new Map<string, { wins: number; total: number }>();
    rows.forEach(r => {
      const created = salesCreated[r.sale_id];
      if (!created) return;
      const ck = monthKey(new Date(created));
      const xk = monthKey(new Date(r.analyzed_at));
      const k = `${ck}||${xk}`;
      const cur = grouped.get(k) ?? { wins: 0, total: 0 };
      cur.total++;
      if (r.outcome === "won") cur.wins++;
      grouped.set(k, cur);
    });
    const cells: CohortCell[] = Array.from(grouped.entries()).map(([k, v]) => {
      const [createdMonth, closedMonth] = k.split("||");
      return {
        createdMonth,
        closedMonth,
        total: v.total,
        wins: v.wins,
        winRate: v.total ? (v.wins / v.total) * 100 : 0,
      };
    });
    const createdMonths = Array.from(new Set(cells.map(c => c.createdMonth))).sort();
    const closedMonths = Array.from(new Set(cells.map(c => c.closedMonth))).sort();
    return { cells, createdMonths, closedMonths };
  }, [rows, salesCreated]);
};
