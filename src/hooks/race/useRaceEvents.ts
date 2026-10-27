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

type Channel = ReturnType<typeof supabase.channel>;

// Cache de módulo: um canal por seasonId, mantido pela vida do app — dedupe
// para os múltiplos componentes (HUD + sidebar + TV) que montam o hook juntos,
// sem o removeChannel+delete síncrono que reutilizava canal morto no remount
// do Strict-Mode. Limpo no Vite HMR via import.meta.hot.
const channelCache = new Map<string, Channel>();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    channelCache.forEach(ch => supabase.removeChannel(ch));
    channelCache.clear();
  });
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
    const key = `race-events-${seasonId}`;
    let channel = channelCache.get(key);
    if (!channel) {
      channel = supabase
        .channel(key)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'race_events',
            filter: `season_id=eq.${seasonId}`,
          },
          () => queryClient.invalidateQueries({ queryKey: ['race-events', seasonId] })
        )
        .subscribe();
      channelCache.set(key, channel);
    }
  }, [seasonId, queryClient]);

  return query;
}
