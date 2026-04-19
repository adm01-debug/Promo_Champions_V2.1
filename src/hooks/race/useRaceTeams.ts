import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RaceTeam {
  id: string;
  season_id: string;
  name: string;
  color_primary: string;
  color_secondary: string;
  emoji: string | null;
  member_car_ids: string[];
  total_points: number;
  member_count: number;
}

interface TeamRow {
  id: string;
  season_id: string;
  name: string;
  color_primary: string;
  color_secondary: string;
  emoji: string | null;
}

interface MemberRow {
  team_id: string;
  car_id: string;
}

interface CarSalesRow {
  id: string;
  salesperson_id: string;
}

interface SalesRow {
  salesperson_id: string;
  total_value: number;
}

/**
 * Lista equipes/escuderias da temporada com pontuação agregada (soma do total_sales dos membros).
 */
export function useRaceTeams(seasonId?: string) {
  return useQuery({
    queryKey: ['race-teams', seasonId],
    queryFn: async (): Promise<RaceTeam[]> => {
      if (!seasonId) return [];

      const { data: teams, error: tErr } = await supabase
        .from('race_teams')
        .select('id, season_id, name, color_primary, color_secondary, emoji')
        .eq('season_id', seasonId)
        .order('name');
      if (tErr) throw tErr;
      if (!teams || teams.length === 0) return [];

      const teamIds = teams.map((t) => t.id);
      const { data: members, error: mErr } = await supabase
        .from('race_team_members')
        .select('team_id, car_id')
        .in('team_id', teamIds);
      if (mErr) throw mErr;

      const carIds = (members ?? []).map((m: MemberRow) => m.car_id);
      let lbMap = new Map<string, number>();
      if (carIds.length > 0) {
        const { data: lb } = await supabase
          .from('race_leaderboard_view')
          .select('car_id, total_sales')
          .eq('season_id', seasonId)
          .in('car_id', carIds);
        (lb ?? []).forEach((r) => {
          if (r.car_id) lbMap.set(r.car_id, Number(r.total_sales ?? 0));
        });
      }

      return (teams as TeamRow[]).map((t) => {
        const memberIds = (members ?? [])
          .filter((m: MemberRow) => m.team_id === t.id)
          .map((m: MemberRow) => m.car_id);
        const points = memberIds.reduce((acc, id) => acc + (lbMap.get(id) ?? 0), 0);
        return {
          ...t,
          member_car_ids: memberIds,
          member_count: memberIds.length,
          total_points: points,
        };
      }).sort((a, b) => b.total_points - a.total_points);
    },
    enabled: !!seasonId,
    staleTime: 30_000,
  });
}
