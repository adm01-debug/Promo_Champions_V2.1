/**
 * Registro diário de humor do vendedor (mood_entries), 1 entrada por
 * salesperson_id + entry_date. Usado pelo MoodTrackerWidget.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTodayMood(salespersonId: string | undefined, today: string) {
  return useQuery({
    queryKey: ['mood-today', salespersonId, today],
    queryFn: async () => {
      if (!salespersonId) return null;
      const { data, error } = await supabase
        .from('mood_entries')
        .select('mood_value')
        .eq('salesperson_id', salespersonId)
        .eq('entry_date', today)
        .maybeSingle();
      if (error || !data) return null;
      return data.mood_value;
    },
    enabled: !!salespersonId,
  });
}

export function useSubmitMood(salespersonId: string | undefined, today: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (moodValue: number) => {
      if (!salespersonId) throw new Error('Not authenticated');
      const { error } = await supabase.from('mood_entries').upsert(
        { salesperson_id: salespersonId, entry_date: today, mood_value: moodValue },
        { onConflict: 'salesperson_id,entry_date' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-today'] });
    },
  });
}
