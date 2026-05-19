import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export function useSalesBattles() {
  const queryClient = useQueryClient();

  const { data: battles, isLoading } = useQuery({
    queryKey: ['sales-battles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_battles')
        .select(`
          *,
          battle_participants (
            id, salesperson_id, team_name, current_score,
            salespeople:salesperson_id (name, role)
          )
        `)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime for live scores
  useEffect(() => {
    const channel = supabase
      .channel('battles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'battle_participants' }, () => {
        queryClient.invalidateQueries({ queryKey: ['sales-battles'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const createBattle = useMutation({
    mutationFn: async (battle: {
      title: string;
      battle_type: string;
      metric: string;
      target_value?: number;
      ends_at: string;
      xp_reward: number;
      created_by: string;
      participant_ids: string[];
    }) => {
      const { participant_ids, ...battleData } = battle;
      const { data, error } = await supabase.from('sales_battles').insert(battleData).select().single();
      if (error) throw error;

      // Add participants
      const participants = participant_ids.map(id => ({
        battle_id: data.id,
        salesperson_id: id,
      }));
      const { error: pError } = await supabase.from('battle_participants').insert(participants);
      if (pError) throw pError;

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-battles'] }),
  });

  const updateScore = useMutation({
    mutationFn: async ({ participantId, newScore }: { participantId: string; newScore: number }) => {
      const { error } = await supabase
        .from('battle_participants')
        .update({ current_score: newScore })
        .eq('id', participantId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-battles'] }),
  });

  return { battles, isLoading, createBattle, updateScore };
}
