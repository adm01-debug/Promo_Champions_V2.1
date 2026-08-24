import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RacePowerup {
  id: string;
  season_id: string;
  salesperson_id: string;
  powerup_type: 'turbo' | 'shield' | 'lightning';
  position_pct: number;
  used_at: string | null;
}

export function useRacePowerups(seasonId?: string, salespersonId?: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['race-powerups', seasonId, salespersonId],
    queryFn: async (): Promise<RacePowerup[]> => {
      if (!seasonId || !salespersonId) return [];
      const { data, error } = await supabase
        .from('race_powerups')
        .select('id, season_id, salesperson_id, powerup_type, used_at, effect_data')
        .eq('season_id', seasonId)
        .eq('salesperson_id', salespersonId);
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        season_id: r.season_id,
        salesperson_id: r.salesperson_id,
        powerup_type: r.powerup_type as RacePowerup['powerup_type'],
        position_pct: Number((r.effect_data as Record<string, unknown>)?.position_pct ?? 0),
        used_at: r.used_at,
      }));
    },
    enabled: !!seasonId && !!salespersonId,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!seasonId) return;
    const channel = supabase
      .channel(`race-powerups-${seasonId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'race_powerups', filter: `season_id=eq.${seasonId}` }, () => {
        qc.invalidateQueries({ queryKey: ['race-powerups', seasonId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [seasonId, qc]);

  return query;
}

export async function collectRacePowerup(powerupId: string) {
  const { data, error } = await supabase.functions.invoke('collect-race-powerup', { body: { powerup_id: powerupId } });
  if (error) throw error;
  return data;
}
