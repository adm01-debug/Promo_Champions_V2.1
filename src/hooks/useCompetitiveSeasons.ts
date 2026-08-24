import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCompetitiveSeasons() {
  const { data: currentSeason, isLoading: loadingSeason } = useQuery({
    queryKey: ['competitive-season-active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('competitive_seasons')
        .select('*')
        .eq('status', 'active')
        .lte('starts_at', now)
        .gte('ends_at', now)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: powerUps, isLoading: loadingPowerUps } = useQuery({
    queryKey: ['active-power-ups'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('active_power_ups')
        .select('*, salespeople:salesperson_id (name)')
        .eq('is_active', true)
        .gte('expires_at', now);
      if (error) throw error;
      return data || [];
    },
  });

  return {
    currentSeason,
    powerUps,
    isLoading: loadingSeason || loadingPowerUps,
  };
}
