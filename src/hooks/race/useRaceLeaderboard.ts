import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RaceLeaderboardEntry {
  season_id: string;
  car_id: string;
  salesperson_id: string;
  salesperson_name: string;
  avatar_url: string | null;
  car_number: number;
  primary_color: string;
  secondary_color: string;
  car_style: 'f1' | 'stock' | 'kart';
  nickname: string | null;
  role_type?: 'closer' | 'sdr';
  total_sales: number;
  deals_count: number;
  new_clients_count?: number;
  activities_count?: number;
  conversations_count?: number;
  score?: number;
  progress: number;
  rank?: number;
}

// Round 3 — dedupe de canais por seasonId.
const channelRefs = new Map<string, { count: number; channel: ReturnType<typeof supabase.channel> }>();

export function useRaceLeaderboard(seasonId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['race-leaderboard', seasonId],
    queryFn: async (): Promise<RaceLeaderboardEntry[]> => {
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('race_leaderboard_view')
        .select('*')
        .eq('season_id', seasonId);
      if (error) throw error;
      const rows = (data || []) as RaceLeaderboardEntry[];
      const sorted = [...rows].sort((a, b) => Number(b.progress) - Number(a.progress));
      return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
    },
    enabled: !!seasonId,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!seasonId) return;
    const key = `race-lb-${seasonId}`;
    const existing = channelRefs.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      const channel = supabase
        .channel(key)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
          queryClient.invalidateQueries({ queryKey: ['race-leaderboard', seasonId] });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'race_cars' }, () => {
          queryClient.invalidateQueries({ queryKey: ['race-leaderboard', seasonId] });
        })
        .subscribe();
      channelRefs.set(key, { count: 1, channel });
    }
    return () => {
      const ref = channelRefs.get(key);
      if (!ref) return;
      ref.count -= 1;
      if (ref.count <= 0) {
        supabase.removeChannel(ref.channel);
        channelRefs.delete(key);
      }
    };
  }, [seasonId, queryClient]);

  return query;
}
