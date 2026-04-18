import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RaceReaction {
  id: string;
  season_id: string | null;
  target_car_id: string;
  reactor_user_id: string;
  emoji: string;
  created_at: string;
}

export const REACTION_EMOJIS = ['🔥', '👏', '😱', '🚀'] as const;

/** Lista reactions dos últimos 60s para um conjunto de carros, com agregação por carro+emoji */
export function useRaceReactions(carIds: string[], seasonId?: string | null) {
  const qc = useQueryClient();
  const [recent, setRecent] = useState<RaceReaction[]>([]);

  const query = useQuery({
    queryKey: ['race-reactions', seasonId ?? 'none', carIds.sort().join(',')],
    enabled: carIds.length > 0,
    queryFn: async (): Promise<RaceReaction[]> => {
      const sinceIso = new Date(Date.now() - 60_000).toISOString();
      let q = supabase
        .from('race_reactions')
        .select('*')
        .gte('created_at', sinceIso)
        .in('target_car_id', carIds)
        .order('created_at', { ascending: false })
        .limit(200);
      if (seasonId) q = q.eq('season_id', seasonId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as RaceReaction[];
    },
    staleTime: 15_000,
  });

  // Realtime subscription
  useEffect(() => {
    if (carIds.length === 0) return;
    const channelName = `race-reactions-${seasonId ?? 'global'}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'race_reactions' },
        (payload) => {
          const row = payload.new as RaceReaction;
          if (!carIds.includes(row.target_car_id)) return;
          setRecent((prev) => [row, ...prev].slice(0, 50));
          qc.invalidateQueries({ queryKey: ['race-reactions'] });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [carIds.join(','), seasonId, qc]);

  return { ...query, liveBurst: recent };
}

export function useSendRaceReaction() {
  return useMutation({
    mutationFn: async ({ carId, emoji, seasonId }: { carId: string; emoji: string; seasonId?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login necessário');
      const { error } = await supabase.from('race_reactions').insert({
        target_car_id: carId,
        emoji,
        reactor_user_id: user.id,
        season_id: seasonId ?? null,
      });
      if (error) throw error;
    },
  });
}
