import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabase/fetchAllRows';

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
    queryFn: async (): Promise<{
      entries: CareerSeasonEntry[];
      summary: CareerSummary;
    }> => {
      const empty: CareerSummary = {
        total_seasons: 0,
        total_titles: 0,
        total_podiums: 0,
        total_points: 0,
        best_rank: null,
      };
      if (!salespersonId) return { entries: [], summary: empty };

      // Busca todas as seasons finalizadas
      const { data: seasons, error: sErr } = await supabase
        .from('race_seasons')
        .select('id, name, start_date, end_date, role_type, status, winner_id')
        .order('end_date', { ascending: false });
      if (sErr) throw sErr;

      const seasonIds = (seasons ?? []).map(s => s.id);

      // Uma única query paginada para o leaderboard de todas as seasons
      // (evita N+1); o agrupamento por season é feito no cliente. Paginação
      // necessária: seasons x vendedores pode exceder o teto de 1000 linhas
      // do PostgREST.
      const leaderboardBySeason = new Map<
        string,
        { salesperson_id: string; total_sales: number }[]
      >();
      if (seasonIds.length > 0) {
        const lbRows = await fetchAllRows(
          (from, to) =>
            supabase
              .from('race_leaderboard_view')
              .select('season_id, salesperson_id, total_sales')
              .in('season_id', seasonIds)
              .range(from, to),
          { label: 'useMyCareer:leaderboard' }
        );

        for (const row of lbRows) {
          if (row.season_id == null || row.salesperson_id == null) continue;
          const rows = leaderboardBySeason.get(row.season_id) ?? [];
          rows.push({
            salesperson_id: row.salesperson_id,
            total_sales: row.total_sales ?? 0,
          });
          leaderboardBySeason.set(row.season_id, rows);
        }
      }

      const entries: CareerSeasonEntry[] = [];

      for (const s of seasons ?? []) {
        // Pega ranking final da season
        const lb = leaderboardBySeason.get(s.id);

        if (!lb || lb.length === 0) continue;
        const sorted = [...lb].sort(
          (a, b) => Number(b.total_sales) - Number(a.total_sales)
        );
        const idx = sorted.findIndex(r => r.salesperson_id === salespersonId);
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

      const finished = entries.filter(e => e.final_rank !== null);
      const summary: CareerSummary = {
        total_seasons: entries.length,
        total_titles: entries.filter(e => e.was_champion).length,
        total_podiums: finished.filter(e => (e.final_rank ?? 99) <= 3).length,
        total_points: entries.reduce((a, e) => a + e.total_sales, 0),
        best_rank: finished.length
          ? Math.min(...finished.map(e => e.final_rank ?? 99))
          : null,
      };

      return { entries, summary };
    },
    enabled: !!salespersonId,
    staleTime: 60_000,
  });
}
