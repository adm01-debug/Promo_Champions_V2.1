import { useMemo } from 'react';
import type { RaceEvent } from "@/hooks/race/useRaceEvents";
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";

export type TrackCondition = 'sunny' | 'cloudy' | 'rainy' | 'storm';

export interface TrackConditionsResult {
  condition: TrackCondition;
  label: string;
  emoji: string;
  description: string;
  intensity: number;
  recentDeals: number;
  baselinePer2h: number;
}

const META: Record<TrackCondition, { label: string; emoji: string; description: string }> = {
  sunny: { label: 'Ensolarado', emoji: '☀️', description: 'Time em chamas — ritmo acima da média.' },
  cloudy: { label: 'Nublado', emoji: '⛅', description: 'Ritmo estável, dentro do esperado.' },
  rainy: { label: 'Chuvoso', emoji: '🌧️', description: 'Ritmo abaixo da média — hora de acelerar.' },
  storm: { label: 'Tempestade', emoji: '⛈️', description: 'Pista parada — momento crítico para reagir.' },
};

interface Params {
  events: RaceEvent[];
  leaderboard: RaceLeaderboardEntry[];
  seasonStart?: string;
}

/**
 * Calcula condição da pista a partir do momentum coletivo recente vs. baseline da season.
 */
export function useTrackConditions({ events, leaderboard, seasonStart }: Params): TrackConditionsResult {
  return useMemo(() => {
    const now = Date.now();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    const dealEvents = events.filter((e) => {
      const t = e.event_type;
      return t === 'overtake' || t === 'checkpoint' || t === 'victory';
    });

    const recentDeals = dealEvents.filter(
      (e) => now - new Date(e.created_at).getTime() <= twoHoursMs,
    ).length;

    const totalDeals = leaderboard.reduce((sum, e) => sum + Number(e.deals_count ?? 0), 0);
    const startMs = seasonStart ? new Date(seasonStart).getTime() : now - twoHoursMs;
    const elapsedMs = Math.max(twoHoursMs, now - startMs);
    const baselinePer2h = (totalDeals / (elapsedMs / twoHoursMs)) || 1;

    const intensity = recentDeals / Math.max(0.5, baselinePer2h);

    let condition: TrackCondition;
    if (intensity >= 1.5) condition = 'sunny';
    else if (intensity >= 0.7) condition = 'cloudy';
    else if (intensity >= 0.3) condition = 'rainy';
    else condition = 'storm';

    return {
      condition,
      ...META[condition],
      intensity,
      recentDeals,
      baselinePer2h,
    };
  }, [events, leaderboard, seasonStart]);
}
