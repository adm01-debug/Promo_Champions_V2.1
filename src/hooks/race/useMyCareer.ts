import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CareerSeasonEntry {
  season_id: string;
  season_name: string;
  start_date: string;
  end_date: string;
  role_type: 'closer' | 'sdr';
  final_rank: number | null;
  total_sales: number;
  was_champion: boolean;
}

export interface CareerSummary {
  total_seasons: number;
  total_titles: number;
  total_podiums: number;
  total_points: number;
  best_rank: number | null;
}

/**
 * Histórico vitalício do salesperson em todas as seasons.
 * Agrega rank final via race_leaderboard_view (snapshot da season finalizada).
 */
export function useMyCareer(salespersonId?: string) {
  return useQuery({
    queryKey: ['my-career', salespersonId],
    queryFn: async (): Promise<{ entries: CareerSeasonEntry[]; summary: CareerSummary }> => {
      const empty: CareerSummary = {
        total_seasons: 0,
        total_titles: 0,
        total_podiums: 0,
        total_points: 0,
        best_rank: null,
      };
      if (!salespersonId) return { entries: [], summary: empty };

      // Busca todos os carros do salesperson (1 por season normalmente)
      const { data: cars } = await supabase
        .from('race_cars')
        .select('id, salesperson_id')
        .eq('salesperson_id', salespersonId);

      // Busca todas as seasons finalizadas
      const { data: seasons, error: sErr } = await supabase
        .from('race_seasons')
        .select('id, name, start_date, end_date, role_type, status, winner_id')
        .order('end_date', { ascending: false });
      if (sErr) throw sErr;

      const entries: CareerSeasonEntry[] = [];

      for (const s of seasons ?? []) {
        // Pega ranking final da season
        const { data: lb } = await supabase
          .from('race_leaderboard_view')
          .select('salesperson_id, total_sales')
          .eq('season_id', s.id);

        if (!lb || lb.length === 0) continue;
        const sorted = [...lb].sort(
          (a, b) => Number(b.total_sales) - Number(a.total_sales),
        );
        const idx = sorted.findIndex((r) => r.salesperson_id === salespersonId);
        if (idx === -1) continue;

        const rank = idx + 1;
        const isFinished = s.status === 'finished';
        entries.push({
          season_id: s.id,
          season_name: s.name,
          start_date: s.start_date,
          end_date: s.end_date,
          role_type: s.role_type as 'closer' | 'sdr',
          final_rank: isFinished ? rank : null,
          total_sales: Number(sorted[idx].total_sales),
          was_champion: isFinished && s.winner_id === salespersonId,
        });
      }

      const finished = entries.filter((e) => e.final_rank !== null);
      const summary: CareerSummary = {
        total_seasons: entries.length,
        total_titles: entries.filter((e) => e.was_champion).length,
        total_podiums: finished.filter((e) => (e.final_rank ?? 99) <= 3).length,
        total_points: entries.reduce((a, e) => a + e.total_sales, 0),
        best_rank: finished.length
          ? Math.min(...finished.map((e) => e.final_rank ?? 99))
          : null,
      };

      return { entries, summary };
    },
    enabled: !!salespersonId,
    staleTime: 60_000,
  });
}
