import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RaceEvent {
  id: string;
  season_id: string;
  salesperson_id: string;
  event_type: 'boost' | 'overtake' | 'checkpoint' | 'powerup' | 'victory' | 'pitstop';
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useRaceEvents(seasonId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['race-events', seasonId],
    queryFn: async (): Promise<RaceEvent[]> => {
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('race_events')
        .select('*')
        .eq('season_id', seasonId)
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []) as RaceEvent[];
    },
    enabled: !!seasonId,
    staleTime: 5_000,
  });

  useEffect(() => {
    if (!seasonId) return;
    const channel = supabase
      .channel(`race-events-${seasonId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'race_events', filter: `season_id=eq.${seasonId}` },
        () => queryClient.invalidateQueries({ queryKey: ['race-events', seasonId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [seasonId, queryClient]);

  return query;
}
