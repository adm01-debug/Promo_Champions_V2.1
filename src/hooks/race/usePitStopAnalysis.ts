import { useMemo } from 'react';
import { differenceInDays, differenceInCalendarDays } from 'date-fns';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";
import type { RaceSeason } from "@/hooks/race/useRaceSeason";

export interface PitStopAnalysis {
  hasData: boolean;
  myStats: {
    rank: number;
    totalSales: number;
    dealsCount: number;
    progress: number;
  } | null;
  nextRival: {
    name: string;
    avatarUrl: string | null;
    rank: number;
    gap: number;
    salesNeeded: number;
  } | null;
  pace: {
    daysElapsed: number;
    daysRemaining: number;
    currentPerDay: number;
    requiredPerDay: number;
    onTrack: boolean;
  } | null;
  recommendation: string;
}

interface Params {
  leaderboard: RaceLeaderboardEntry[];
  mySalespersonId?: string;
  season?: { start_date: string; end_date: string; goal_amount: number } | RaceSeason | null;
}

/**
 * Pure analytical hook for the Pit Stop tactical pause.
 * Computes user's current standing, gap to the rival immediately ahead,
 * pace vs. required pace, and a contextual recommendation string.
 */
export function usePitStopAnalysis({ leaderboard, mySalespersonId, season }: Params): PitStopAnalysis {
  return useMemo<PitStopAnalysis>(() => {
    if (!season || !mySalespersonId || leaderboard.length === 0) {
      return {
        hasData: false,
        myStats: null,
        nextRival: null,
        pace: null,
        recommendation: 'Aguardando dados da season para gerar diagnóstico tático.',
      };
    }

    const sorted = [...leaderboard].sort((a, b) => Number(b.total_sales) - Number(a.total_sales));
    const myIdx = sorted.findIndex((e) => e.salesperson_id === mySalespersonId);
    const me = myIdx >= 0 ? sorted[myIdx] : null;

    if (!me) {
      return {
        hasData: false,
        myStats: null,
        nextRival: null,
        pace: null,
        recommendation: 'Você ainda não está na corrida desta season. Faça sua primeira venda!',
      };
    }

    const myStats = {
      rank: myIdx + 1,
      totalSales: Number(me.total_sales) || 0,
      dealsCount: Number(me.deals_count) || 0,
      progress: Number(me.progress) || 0,
    };

    const rivalEntry = myIdx > 0 ? sorted[myIdx - 1] : null;
    const avgTicket = myStats.dealsCount > 0 ? myStats.totalSales / myStats.dealsCount : 0;
    const nextRival = rivalEntry
      ? {
          name: rivalEntry.salesperson_name,
          avatarUrl: rivalEntry.avatar_url,
          rank: myIdx,
          gap: Math.max(0, Number(rivalEntry.total_sales) - myStats.totalSales),
          salesNeeded: avgTicket > 0
            ? Math.ceil((Number(rivalEntry.total_sales) - myStats.totalSales) / avgTicket)
            : 0,
        }
      : null;

    const start = new Date(season.start_date);
    const end = new Date(season.end_date);
    const now = new Date();
    const totalDays = Math.max(1, differenceInDays(end, start));
    const daysElapsed = Math.max(1, differenceInCalendarDays(now, start) + 1);
    const daysRemaining = Math.max(0, differenceInCalendarDays(end, now));
    const currentPerDay = myStats.totalSales / daysElapsed;
    const goal = Number(season.goal_amount) || 0;
    const requiredPerDay = daysRemaining > 0 ? Math.max(0, (goal - myStats.totalSales) / daysRemaining) : 0;
    const onTrack = currentPerDay >= requiredPerDay;

    const pace = { daysElapsed, daysRemaining, currentPerDay, requiredPerDay, onTrack };

    let recommendation: string;
    if (myStats.rank === 1) {
      recommendation = nextRival
        ? `Você lidera! Mantenha pressão para abrir gap.`
        : `Liderança absoluta. Continue executando o plano.`;
    } else if (myStats.rank <= 3) {
      recommendation = nextRival
        ? `Pódio garantido. Faltam ${nextRival.salesNeeded || '–'} deal(s) para ultrapassar ${nextRival.name}.`
        : `Você está no pódio. Mantenha o ritmo.`;
    } else if (nextRival && nextRival.salesNeeded > 0 && nextRival.salesNeeded <= 3) {
      recommendation = `Foque em fechar ${nextRival.salesNeeded} deal(s) para ultrapassar ${nextRival.name}.`;
    } else if (!onTrack && daysRemaining > 0) {
      recommendation = `Ritmo abaixo da meta. Aumente cadência: precisa de ~${Math.round(requiredPerDay).toLocaleString('pt-BR')}/dia.`;
    } else {
      recommendation = `Mantenha o ritmo atual — você está dentro do esperado.`;
    }

    return { hasData: true, myStats, nextRival, pace, recommendation };
  }, [leaderboard, mySalespersonId, season]);
}
