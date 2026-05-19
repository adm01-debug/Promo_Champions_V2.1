import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";
import type { RaceEvent } from "@/hooks/race/useRaceEvents";

interface UseRaceCommentaryOpts {
  seasonId?: string;
  seasonName?: string;
  roleType?: 'closer' | 'sdr';
  leaderboard: RaceLeaderboardEntry[];
  recentEvents: RaceEvent[];
  secondsToEnd?: number;
  enabled?: boolean;
}

export interface CommentaryItem {
  id: string;
  text: string;
  context: string;
  generated_at: string;
}

const PERIODIC_INTERVAL_MS = 90_000; // narração ambient a cada 90s
const MAX_HISTORY = 8;
const COOLDOWN_MS = 8_000; // evita spam quando muitos eventos chegam juntos

/**
 * Hook que dispara narrações IA em momentos significativos:
 * - mudança de líder
 * - ultrapassagens (debounced)
 * - checkpoint passado pelo top 3
 * - tick periódico para manter "vivo"
 */
export function useRaceCommentary({
  seasonId,
  seasonName,
  roleType,
  leaderboard,
  recentEvents,
  secondsToEnd,
  enabled = true,
}: UseRaceCommentaryOpts) {
  const [items, setItems] = useState<CommentaryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const lastCallRef = useRef<number>(0);
  const lastLeaderRef = useRef<string | null>(null);
  const lastEventIdRef = useRef<string | null>(null);
  const periodicTimerRef = useRef<number | null>(null);

  const generate = useCallback(async (context: 'overtake' | 'leader_change' | 'checkpoint' | 'periodic') => {
    if (!enabled || leaderboard.length === 0) return;
    const now = Date.now();
    if (now - lastCallRef.current < COOLDOWN_MS) return;
    lastCallRef.current = now;

    setIsGenerating(true);
    try {
      const payload = {
        seasonName,
        roleType,
        leaderboard: leaderboard.slice(0, 5).map((e, i) => ({
          rank: e.rank ?? i + 1,
          name: e.salesperson_name,
          progress: Number(e.progress),
          total_sales: e.total_sales,
          deals_count: e.deals_count,
        })),
        recentEvents: recentEvents.slice(0, 3).map(ev => ({
          type: ev.event_type,
          actor: leaderboard.find(l => l.salesperson_id === ev.salesperson_id)?.salesperson_name,
        })),
        context,
        secondsToEnd,
      };
      const { data, error } = await supabase.functions.invoke('race-commentary', { body: payload });
      if (error) throw error;
      const text = (data as { commentary?: string })?.commentary?.trim();
      if (!text) return;
      setItems(prev => [
        { id: `${context}-${now}`, text, context, generated_at: new Date().toISOString() },
        ...prev,
      ].slice(0, MAX_HISTORY));
    } catch (err) {
      // silent — narração é "nice to have", não bloqueia UX
      console.warn('[race-commentary] generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  }, [enabled, leaderboard, recentEvents, seasonName, roleType, secondsToEnd]);

  // Detecta mudança de líder
  useEffect(() => {
    if (!enabled || leaderboard.length === 0) return;
    const sorted = [...leaderboard].sort((a, b) => Number(b.progress) - Number(a.progress));
    const leaderId = sorted[0]?.salesperson_id ?? null;
    if (lastLeaderRef.current !== null && leaderId && lastLeaderRef.current !== leaderId) {
      generate('leader_change');
    }
    lastLeaderRef.current = leaderId;
  }, [leaderboard, enabled, generate]);

  // Reage ao evento mais recente (overtake / checkpoint)
  useEffect(() => {
    if (!enabled || recentEvents.length === 0) return;
    const newest = recentEvents[0];
    if (lastEventIdRef.current === newest.id) return;
    lastEventIdRef.current = newest.id;
    if (newest.event_type === 'overtake') generate('overtake');
    else if (newest.event_type === 'checkpoint') generate('checkpoint');
  }, [recentEvents, enabled, generate]);

  // Tick periódico
  useEffect(() => {
    if (!enabled || !seasonId) return;
    periodicTimerRef.current = window.setInterval(() => {
      generate('periodic');
    }, PERIODIC_INTERVAL_MS);
    return () => {
      if (periodicTimerRef.current) window.clearInterval(periodicTimerRef.current);
    };
  }, [enabled, seasonId, generate]);

  return { items, isGenerating, regenerate: () => generate('periodic') };
}
