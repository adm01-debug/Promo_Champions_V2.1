import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CadenceComparisonRow {
  cadence_id: string;
  cadence_name: string;
  total_enrolled: number;
  active: number;
  completed: number;
  cancelled: number;
  approved: number;
  conversion_rate: number;
  avg_days_to_complete: number;
}

interface RawRow {
  id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  cadence: { id: string; name: string } | null;
  quote: { status: string | null } | null;
}

export function useQuoteCadenceComparison() {
  return useQuery({
    queryKey: ["quote-cadence-comparison"],
    queryFn: async (): Promise<CadenceComparisonRow[]> => {
      const { data, error } = await supabase
        .from("prospect_cadences")
        .select(`
          id, status, started_at, completed_at,
          cadence:cadences(id, name),
          quote:quotes(status)
        `)
        .not("quote_id", "is", null);
      if (error) throw error;

      const rows = (data ?? []) as unknown as RawRow[];
      const grouped = new Map<string, RawRow[]>();
      for (const r of rows) {
        const id = r.cadence?.id;
        if (!id) continue;
        if (!grouped.has(id)) grouped.set(id, []);
        grouped.get(id)!.push(r);
      }

      const out: CadenceComparisonRow[] = [];
      for (const [cid, items] of grouped) {
        const total = items.length;
        const active = items.filter((i) => i.status === "active").length;
        const completed = items.filter((i) => i.status === "completed").length;
        const cancelled = items.filter((i) => i.status === "cancelled").length;
        const approved = items.filter((i) => i.quote?.status === "approved").length;
        const finished = completed + cancelled;
        const conversion_rate = finished > 0 ? Math.round((approved / finished) * 100) : 0;

        const durations = items
          .filter((i) => i.completed_at && i.started_at)
          .map((i) => {
            const a = new Date(i.started_at!).getTime();
            const b = new Date(i.completed_at!).getTime();
            return (b - a) / (1000 * 60 * 60 * 24);
          });
        const avg_days_to_complete =
          durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

        out.push({
          cadence_id: cid,
          cadence_name: items[0].cadence?.name ?? "—",
          total_enrolled: total,
          active,
          completed,
          cancelled,
          approved,
          conversion_rate,
          avg_days_to_complete,
        });
      }
      return out.sort((a, b) => b.conversion_rate - a.conversion_rate);
    },
    staleTime: 60_000,
  });
}
