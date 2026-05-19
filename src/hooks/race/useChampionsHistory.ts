import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RoleType } from "@/hooks/race/useRaceSeasonByRole";

export interface ChampionHistoryEntry {
  seasonId: string;
  seasonName: string;
  endDate: string;
  roleType: RoleType | null;
  championId: string;
  championName: string;
  avatarUrl: string | null;
  totalSales: number;
  carNumber: number | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

/** Histórico de campeões — uma entry por season finalizada com winner. */
export function useChampionsHistory(roleType?: RoleType, limit = 12) {
  return useQuery({
    queryKey: ['champions-history', roleType ?? 'all', limit],
    queryFn: async (): Promise<ChampionHistoryEntry[]> => {
      let q = supabase
        .from('race_seasons')
        .select('id, name, end_date, role_type, winner_id, updated_at')
        .eq('status', 'finished')
        .not('winner_id', 'is', null)
        .order('end_date', { ascending: false })
        .limit(limit);
      if (roleType) q = q.eq('role_type', roleType);

      const { data: seasons, error } = await q;
      if (error) throw error;
      if (!seasons?.length) return [];

      const seasonIds = seasons.map((s) => s.id);
      const winnerIds = seasons.map((s) => s.winner_id!).filter(Boolean);

      const { data: lb } = await supabase
        .from('race_leaderboard_view')
        .select('season_id, salesperson_id, salesperson_name, avatar_url, total_sales, car_number, primary_color, secondary_color')
        .in('season_id', seasonIds)
        .in('salesperson_id', winnerIds);

      const lbMap = new Map<string, NonNullable<typeof lb>[number]>();
      (lb ?? []).forEach((r) => lbMap.set(`${r.season_id}:${r.salesperson_id}`, r));

      return seasons.map((s) => {
        const row = lbMap.get(`${s.id}:${s.winner_id}`);
        return {
          seasonId: s.id,
          seasonName: s.name,
          endDate: s.end_date ?? s.updated_at,
          roleType: (s.role_type as RoleType) ?? null,
          championId: s.winner_id!,
          championName: row?.salesperson_name ?? 'Campeão',
          avatarUrl: row?.avatar_url ?? null,
          totalSales: Number(row?.total_sales ?? 0),
          carNumber: row?.car_number ?? null,
          primaryColor: row?.primary_color ?? null,
          secondaryColor: row?.secondary_color ?? null,
        };
      });
    },
    staleTime: 5 * 60_000,
  });
}
