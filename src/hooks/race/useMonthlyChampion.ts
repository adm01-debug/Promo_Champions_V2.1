import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RoleType } from "@/hooks/race/useRaceSeasonByRole";

export interface MonthlyChampionData {
  season_id: string;
  season_name: string;
  winner_id: string;
  winner_name: string;
  avatar_url: string | null;
  total_sales: number;
  deals_count: number;
  score: number;
  finalized_at: string;
  top5: Array<{ salesperson_name: string; progress: number; score?: number }>;
}

const SEEN_KEY = (seasonId: string) => `monthly-champion-seen-${seasonId}`;

export function useMonthlyChampion(roleType: RoleType) {
  const [dismissed, setDismissed] = useState(false);

  const query = useQuery({
    queryKey: ['monthly-champion', roleType],
    queryFn: async (): Promise<MonthlyChampionData | null> => {
      // Busca a season finished mais recente do role com winner definido
      const { data: season, error: sErr } = await supabase
        .from('race_seasons')
        .select('id, name, winner_id, updated_at')
        .eq('role_type', roleType)
        .eq('status', 'finished')
        .not('winner_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sErr) throw sErr;
      if (!season || !season.winner_id) return null;

      // Busca o evento monthly_champion correspondente
      const { data: event } = await supabase
        .from('race_events')
        .select('metadata, created_at')
        .eq('season_id', season.id)
        .eq('event_type', 'monthly_champion')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Stats do vencedor pela view
      const { data: lb } = await supabase
        .from('race_leaderboard_view')
        .select('salesperson_name, avatar_url, total_sales, deals_count, score')
        .eq('season_id', season.id)
        .eq('salesperson_id', season.winner_id)
        .maybeSingle();

      const meta = (event?.metadata ?? {}) as Record<string, unknown>;
      return {
        season_id: season.id,
        season_name: season.name,
        winner_id: season.winner_id,
        winner_name: lb?.salesperson_name ?? 'Campeão',
        avatar_url: lb?.avatar_url ?? null,
        total_sales: Number(lb?.total_sales ?? 0),
        deals_count: Number(lb?.deals_count ?? 0),
        score: Number(lb?.score ?? 0),
        finalized_at: (meta.finalized_at as string) ?? season.updated_at,
        top5: (meta.top5 as MonthlyChampionData['top5']) ?? [],
      };
    },
    staleTime: 60_000,
  });

  const champion = query.data;
  const alreadySeen = champion ? !!localStorage.getItem(SEEN_KEY(champion.season_id)) : true;
  const shouldShow = !!champion && !alreadySeen && !dismissed;

  const dismiss = () => {
    if (champion) localStorage.setItem(SEEN_KEY(champion.season_id), '1');
    setDismissed(true);
  };

  useEffect(() => { setDismissed(false); }, [champion?.season_id]);

  return { champion, shouldShow, dismiss, isLoading: query.isLoading };
}
