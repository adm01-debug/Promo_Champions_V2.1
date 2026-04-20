import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HourCell {
  dow: number; // 0=Sun .. 6=Sat
  hour: number; // 0..23
  wins: number;
  losses: number;
  winRate: number;
  total: number;
}

interface SaleRow {
  status: string | null;
  updated_at: string | null;
}

export function useWinByHourMatrix() {
  return useQuery({
    queryKey: ["wl-win-by-hour"],
    queryFn: async (): Promise<HourCell[]> => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data, error } = await supabase
        .from("sales")
        .select("status, updated_at")
        .in("status", ["won", "lost"])
        .gte("updated_at", ninetyDaysAgo.toISOString())
        .limit(2000);

      if (error) throw error;
      const rows = (data ?? []) as unknown as SaleRow[];

      const grid = new Map<string, HourCell>();
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          grid.set(`${d}-${h}`, { dow: d, hour: h, wins: 0, losses: 0, winRate: 0, total: 0 });
        }
      }

      rows.forEach((r) => {
        if (!r.updated_at) return;
        const dt = new Date(r.updated_at);
        const k = `${dt.getDay()}-${dt.getHours()}`;
        const cell = grid.get(k);
        if (!cell) return;
        if (r.status === "won") cell.wins++;
        else cell.losses++;
        cell.total = cell.wins + cell.losses;
        cell.winRate = cell.total ? (cell.wins / cell.total) * 100 : 0;
      });

      return Array.from(grid.values());
    },
    staleTime: 10 * 60_000,
  });
}
