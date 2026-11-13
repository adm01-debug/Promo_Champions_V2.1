import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

type Channel = ReturnType<typeof supabase.channel>;

// Module-level cache: stores the channel for each topic so that
// Strict-Mode double-mount reuses the same channel instead of creating a new
// one. Cleared on Vite HMR via import.meta.hot.
const channelCache = new Map<string, Channel>();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    channelCache.forEach(ch => supabase.removeChannel(ch));
    channelCache.clear();
  });
}

export function useSalesBattles() {
  const queryClient = useQueryClient();
  const channelRef = useRef<Channel | null>(null);

  const { data: battles, isLoading } = useQuery({
    queryKey: ['sales-battles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_battles')
        .select(
          `
          *,
          battle_participants (
            id, salesperson_id, team_name, current_score,
            salespeople:salesperson_id (name, role)
          )
        `
        )
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime for live scores — module-level cache keeps a single subscribed
  // channel per topic, even across Strict-Mode double-mounts.
  useEffect(() => {
    const topic = 'battles-realtime';
    let channel = channelCache.get(topic);

    if (!channel) {
      channel = supabase
        .channel(topic)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'battle_participants' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['sales-battles'] });
          }
        )
        .subscribe();
      channelCache.set(topic, channel);
    }
    channelRef.current = channel;

    return () => {
      channelRef.current = null;
    };
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
      const { data, error } = await supabase
        .from('sales_battles')
        .insert(battleData)
        .select()
        .single();
      if (error) throw error;

      // Add participants
      const participants = participant_ids.map(id => ({
        battle_id: data.id,
        salesperson_id: id,
      }));
      const { error: pError } = await supabase
        .from('battle_participants')
        .insert(participants);
      if (pError) throw pError;

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-battles'] }),
  });

  const updateScore = useMutation({
    mutationFn: async ({
      participantId,
      newScore,
    }: {
      participantId: string;
      newScore: number;
    }) => {
      const { error } = await supabase
        .from('battle_participants')
        .update({ current_score: newScore })
        .eq('id', participantId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-battles'] }),
  });

  // RLS (is_admin_or_manager) bloqueia em silêncio: 0 linhas sem erro.
  // O `.select('id')` permite detectar isso e avisar o usuário.
  // Só batalhas 'active' mudam: finalizada é histórico (Hall of Fame) e
  // cancelá-la a tiraria da listagem.
  const updateBattle = useMutation({
    mutationFn: async ({
      id,
      ...changes
    }: {
      id: string;
      title: string;
      battle_type: string;
      metric: string;
      ends_at: string;
      xp_reward: number;
    }) => {
      const { data, error } = await supabase
        .from('sales_battles')
        .update(changes)
        .eq('id', id)
        .eq('status', 'active')
        .select('id');
      if (error) throw error;
      if (!data?.length)
        throw new Error('Sem permissão para editar esta batalha ou ela já foi encerrada');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-battles'] }),
  });

  // Cancela em vez de DELETE: a FK de battle_participants é ON DELETE CASCADE e
  // apagaria placar e histórico. A listagem já esconde status 'cancelled'.
  const cancelBattle = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('sales_battles')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('status', 'active')
        .select('id');
      if (error) throw error;
      if (!data?.length)
        throw new Error(
          'Sem permissão para cancelar esta batalha ou ela já foi encerrada'
        );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-battles'] }),
  });

  return { battles, isLoading, createBattle, updateScore, updateBattle, cancelBattle };
}
