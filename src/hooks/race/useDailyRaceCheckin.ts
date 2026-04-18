import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SEEN_KEY_PREFIX = 'race_daily_checkin_seen';

export interface DailyCheckinResult {
  already_checked_in_today: boolean;
  streak_days: number;
  previous_streak: number;
  today: { rank: number; progress: number; total_sales: number; deals_count: number } | null;
  previous: { date: string; rank: number; progress: number; total_sales: number; deals_count: number } | null;
  delta: { rank: number; progress: number; total_sales: number; deals_count: number } | null;
}

interface Opts {
  seasonId?: string;
  salespersonId?: string;
  enabled?: boolean;
}

/**
 * Daily check-in: dispara modal 1x por dia (BR timezone) ao primeiro acesso,
 * registra streak e mostra delta vs ontem.
 */
export function useDailyRaceCheckin({ seasonId, salespersonId, enabled = true }: Opts) {
  const [data, setData] = useState<DailyCheckinResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const localKey = seasonId && salespersonId
    ? `${SEEN_KEY_PREFIX}:${seasonId}:${salespersonId}:${new Date().toISOString().slice(0, 10)}`
    : null;

  const trigger = useCallback(async () => {
    if (!enabled || !seasonId || !salespersonId) return;
    setLoading(true);
    try {
      const { data: rpcData, error } = await supabase.rpc('register_race_daily_checkin', {
        _season_id: seasonId,
        _salesperson_id: salespersonId,
      });
      if (error) throw error;
      const parsed = rpcData as unknown as DailyCheckinResult;
      setData(parsed);
      setOpen(true);
      if (localKey) localStorage.setItem(localKey, '1');
    } catch (err) {
      console.warn('[daily-checkin] failed', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, seasonId, salespersonId, localKey]);

  // Auto-trigger uma vez por dia
  useEffect(() => {
    if (!enabled || !seasonId || !salespersonId || !localKey) return;
    if (localStorage.getItem(localKey)) return;
    // pequeno delay para não competir com o load inicial
    const t = window.setTimeout(() => { void trigger(); }, 1200);
    return () => window.clearTimeout(t);
  }, [enabled, seasonId, salespersonId, localKey, trigger]);

  return { data, open, setOpen, loading, trigger };
}
