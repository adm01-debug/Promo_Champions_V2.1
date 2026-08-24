import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StartSeasonInput {
  name: string;
  start_date: string;
  end_date: string;
  goal_amount: number;
  track_type?: 'oval' | 'circuit' | 'street';
  role_type?: 'closer' | 'sdr';
  scoring_rules?: Array<{
    metric_code: string;
    weight: number;
    points_per_unit: number;
    label?: string;
  }>;
}

export function useStartRaceSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: StartSeasonInput) => {
      const { data, error } = await supabase.functions.invoke('start-race-season', { body: input });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['race-season-active'] });
      qc.invalidateQueries({ queryKey: ['race-leaderboard'] });
      toast.success('Nova temporada iniciada! 🏁');
    },
    onError: (err) => {
      toast.error(`Erro ao iniciar temporada: ${err instanceof Error ? err.message : 'desconhecido'}`);
    },
  });
}
