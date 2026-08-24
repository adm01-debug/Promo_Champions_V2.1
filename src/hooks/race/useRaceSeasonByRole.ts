import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RaceSeason } from "@/hooks/race/useRaceSeason";

export type RoleType = 'closer' | 'sdr';

export interface RaceSeasonWithRole extends RaceSeason {
  role_type: RoleType;
}

type Channel = ReturnType<typeof supabase.channel>;

// Module-level cache: stores the channel for each (roleType) so that
// Strict-Mode double-mount reuses the same channel instead of creating a new
// one. Cleared on Vite HMR via import.meta.hot.
const channelCache = new Map<string, Channel>();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    channelCache.forEach((ch) => supabase.removeChannel(ch));
    channelCache.clear();
  });
}

export function useRaceSeasonByRole(roleType: RoleType) {
  const qc = useQueryClient();
  const channelRef = useRef<Channel | null>(null);

  const query = useQuery({
    queryKey: ['race-season-active', roleType],
    queryFn: async (): Promise<RaceSeasonWithRole | null> => {
      const { data, error } = await supabase
        .from('race_seasons')
        .select('*')
        .eq('status', 'active')
        .eq('role_type', roleType)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as RaceSeasonWithRole | null;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const topic = `race-seasons-${roleType}`;
    let ch = channelCache.get(topic);

    if (!ch) {
      ch = supabase
        .channel(topic)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'race_seasons' }, () => {
          qc.invalidateQueries({ queryKey: ['race-season-active', roleType] });
        })
        .subscribe();
      channelCache.set(topic, ch);
    }
    channelRef.current = ch;

    return () => {
      channelRef.current = null;
    };
  }, [roleType, qc]);

  return query;
}
