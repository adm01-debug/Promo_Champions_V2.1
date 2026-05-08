import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface RankingRow {
  id: string;
  name: string;
  avatarUrl: string | null;
  revenue: number;
  deals: number;
  position: number;
  prevPosition: number | null;
  delta: number | null; // prev - current (positive = subiu posições)
  revenueChangePct: number;
}

const buildMap = (
  rows: { salesperson_id: string | null; amount: number; status: string }[],
) => {
  const map = new Map<string, { revenue: number; deals: number }>();
  rows
    .filter((r) => r.status === "completed" && r.salesperson_id)
    .forEach((r) => {
      const cur = map.get(r.salesperson_id!) ?? { revenue: 0, deals: 0 };
      cur.revenue += Number(r.amount);
      cur.deals += 1;
      map.set(r.salesperson_id!, cur);
    });
  return map;
};

const rank = (map: Map<string, { revenue: number; deals: number }>) => {
  const entries = Array.from(map.entries()).sort((a, b) => b[1].revenue - a[1].revenue);
  const positions = new Map<string, number>();
  entries.forEach(([id], i) => positions.set(id, i + 1));
  return positions;
};

export const useFuturisticRanking = () => {
  return useQuery({
    queryKey: ["futuristic-ranking"],
    queryFn: async (): Promise<RankingRow[]> => {
      const now = new Date();
      const curStart = format(startOfMonth(now), "yyyy-MM-dd");
      const curEnd = format(endOfMonth(now), "yyyy-MM-dd");
      const prev = subMonths(now, 1);
      const prevStart = format(startOfMonth(prev), "yyyy-MM-dd");
      const prevEnd = format(endOfMonth(prev), "yyyy-MM-dd");

      const [spRes, curRes, prevRes] = await Promise.all([
        supabase.from("salespeople_public").select("id, name, avatar_url").eq("is_active", true),
        supabase
          .from("sales")
          .select("salesperson_id, amount, status")
          .gte("created_at", curStart)
          .lte("created_at", curEnd),
        supabase
          .from("sales")
          .select("salesperson_id, amount, status")
          .gte("created_at", prevStart)
          .lte("created_at", prevEnd),
      ]);

      const sps = spRes.data ?? [];
      const curMap = buildMap(curRes.data ?? []);
      const prevMap = buildMap(prevRes.data ?? []);
      const curPos = rank(curMap);
      const prevPos = rank(prevMap);

      const rows: RankingRow[] = sps
        .filter((sp): sp is { id: string; name: string; avatar_url: string | null } => !!sp.id && !!sp.name)
        .map((sp) => {
          const cur = curMap.get(sp.id) ?? { revenue: 0, deals: 0 };
          const prev = prevMap.get(sp.id);
          const position = curPos.get(sp.id) ?? sps.length;
          const prevPosition = prevPos.get(sp.id) ?? null;
          const delta = prevPosition != null ? prevPosition - position : null;
          const prevRev = prev?.revenue ?? 0;
          const revenueChangePct =
            prevRev === 0 ? (cur.revenue > 0 ? 100 : 0) : ((cur.revenue - prevRev) / prevRev) * 100;
          return {
            id: sp.id,
            name: sp.name,
            avatarUrl: sp.avatar_url,
            revenue: cur.revenue,
            deals: cur.deals,
            position,
            prevPosition,
            delta,
            revenueChangePct,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .map((r, i) => ({ ...r, position: i + 1 }));

      return rows;
    },
    staleTime: 5 * 60 * 1000,
  });
};
