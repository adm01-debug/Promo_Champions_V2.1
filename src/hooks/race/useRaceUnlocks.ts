import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RaceUnlock {
  id: string;
  user_id: string;
  unlock_key: string;
  unlocked_at: string;
}

export function useRaceUnlocks() {
  return useQuery({
    queryKey: ['race-unlocks'],
    queryFn: async (): Promise<RaceUnlock[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('race_unlocks')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as RaceUnlock[];
    },
    staleTime: 30_000,
  });
}

export function useUnlockRaceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ unlockKey, requiredLeague }: { unlockKey: string; requiredLeague: string }) => {
      const { data, error } = await supabase.rpc('unlock_race_item', {
        _unlock_key: unlockKey,
        _required_league: requiredLeague,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string; current_league?: string; required_league?: string };
      if (!result.success) {
        if (result.error === 'league_required') {
          throw new Error(`Requer liga ${result.required_league?.toUpperCase()} (você está em ${result.current_league?.toUpperCase()})`);
        }
        throw new Error(result.error ?? 'Falha ao desbloquear');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('🎉 Item desbloqueado!');
      qc.invalidateQueries({ queryKey: ['race-unlocks'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
