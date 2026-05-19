import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RaceSeason } from "@/hooks/race/useRaceSeason";

export type RoleType = 'closer' | 'sdr';

export interface RaceSeasonWithRole extends RaceSeason {
  role_type: RoleType;
}

export function useRaceSeasonByRole(roleType: RoleType) {
  const qc = useQueryClient();

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
    const ch = supabase
      .channel(`race-seasons-${roleType}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'race_seasons' }, () => {
        qc.invalidateQueries({ queryKey: ['race-season-active', roleType] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roleType, qc]);

  return query;
}
