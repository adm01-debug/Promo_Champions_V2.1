import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RaceStreak {
  streakDays: number;
  salesCount: number;
  lastSaleAt: string | null;
  isOnFire: boolean;
  isLegendary: boolean;
}

interface Params {
  salespersonId?: string;
  seasonStart?: string;
  seasonEnd?: string;
}

function toDayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function computeStreak(saleDates: string[]): number {
  if (saleDates.length === 0) return 0;
  const days = new Set(saleDates.map(toDayKey));
  let streak = 0;
  const cursor = new Date();
  // Allow grace: if no sale today, start from yesterday
  let startKey = cursor.toISOString().slice(0, 10);
  if (!days.has(startKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    startKey = cursor.toISOString().slice(0, 10);
    if (!days.has(startKey)) return 0;
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function useRaceStreak({ salespersonId, seasonStart, seasonEnd }: Params) {
  const qc = useQueryClient();
  const enabled = !!salespersonId && !!seasonStart && !!seasonEnd;

  const query = useQuery({
    queryKey: ['race-streak', salespersonId, seasonStart, seasonEnd],
    queryFn: async (): Promise<{ dates: string[] }> => {
      const { data, error } = await supabase
        .from('sales')
        .select('created_at')
        .eq('salesperson_id', salespersonId!)
        .eq('status', 'completed')
        .gte('created_at', seasonStart!)
        .lte('created_at', seasonEnd!);
      if (error) throw error;
      return { dates: (data ?? []).map((d) => d.created_at as string) };
    },
    enabled,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!salespersonId) return;
    const ch = supabase
      .channel(`race-streak-${salespersonId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales', filter: `salesperson_id=eq.${salespersonId}` },
        () => {
          qc.invalidateQueries({ queryKey: ['race-streak', salespersonId] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [salespersonId, qc]);

  const streak: RaceStreak = useMemo(() => {
    const dates = query.data?.dates ?? [];
    const streakDays = computeStreak(dates);
    const lastSaleAt = dates.length
      ? dates.reduce((a, b) => (a > b ? a : b))
      : null;
    return {
      streakDays,
      salesCount: dates.length,
      lastSaleAt,
      isOnFire: streakDays >= 3,
      isLegendary: streakDays >= 7,
    };
  }, [query.data]);

  return { ...streak, isLoading: query.isLoading };
}
