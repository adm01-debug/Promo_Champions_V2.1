import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek } from 'date-fns';

export interface WeeklyMatchup {
  id: string;
  salesperson_a: { id: string; name: string; avatar_url: string | null };
  salesperson_b: { id: string; name: string; avatar_url: string | null };
  score_a: number;
  score_b: number;
  winner_id: string | null;
  status: string;
  xp_reward: number;
  week_start: string;
}

export function useWeeklyMatchups() {
  return useQuery({
    queryKey: ['weekly-matchups'],
    queryFn: async (): Promise<WeeklyMatchup[]> => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

      const { data, error } = await supabase
        .from('weekly_matchups')
        .select(`
          *,
          sp_a:salesperson_a_id(id, name, avatar_url),
          sp_b:salesperson_b_id(id, name, avatar_url)
        `)
        .gte('week_start', weekStart.toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) throw error;

      type SpRef = { id: string; name: string; avatar_url: string | null };
      return (data || []).map((m) => ({
        id: m.id,
        salesperson_a: (m.sp_a as unknown as SpRef) || { id: m.salesperson_a_id, name: 'Vendedor A', avatar_url: null },
        salesperson_b: (m.sp_b as unknown as SpRef) || { id: m.salesperson_b_id, name: 'Vendedor B', avatar_url: null },
        score_a: Number(m.score_a) || 0,
        score_b: Number(m.score_b) || 0,
        winner_id: m.winner_id,
        status: m.status,
        xp_reward: m.xp_reward,
        week_start: m.week_start,
      }));
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
