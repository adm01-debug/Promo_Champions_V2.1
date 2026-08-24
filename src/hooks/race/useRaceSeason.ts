import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RaceSeason {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  track_type: 'oval' | 'circuit' | 'street';
  goal_amount: number;
  status: 'upcoming' | 'active' | 'finished';
  winner_id: string | null;
}

export function useRaceSeason() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['race-season-active'],
    queryFn: async (): Promise<RaceSeason | null> => {
      const { data, error } = await supabase
        .from('race_seasons')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as RaceSeason | null;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('race-seasons-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'race_seasons' }, () => {
        queryClient.invalidateQueries({ queryKey: ['race-season-active'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}
