import { useEffect, useMemo, useState } from 'react';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";

const STORAGE_KEY = 'race_briefing_last_shown';

export interface BriefingData {
  greeting: string;
  pilotFirstName: string;
  rank: number | null;
  totalPilots: number;
  gapToLeaderPercent: number | null;
  streakDays: number;
  goldenWindow: string;
  cta: string;
}

interface Opts {
  entries: RaceLeaderboardEntry[];
  currentUserSalespersonId?: string;
  streakDays?: number;
  /** Hora preferida (heurística, 0-23). Default 14. */
  preferredHour?: number;
  /** Forçar mostrar mesmo se já visto hoje. */
  force?: boolean;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function greetingFor(hour: number): string {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Hook do Daily Briefing cinemático. Decide se deve mostrar (1x/dia)
 * e calcula a mensagem personalizada com dados existentes.
 */
export function useDailyBriefing({
  entries,
  currentUserSalespersonId,
  streakDays = 0,
  preferredHour = 14,
  force = false,
}: Opts) {
  const [open, setOpen] = useState(false);

  const data = useMemo<BriefingData | null>(() => {
    if (!currentUserSalespersonId || entries.length === 0) return null;
    const sorted = [...entries].sort((a, b) => Number(b.progress) - Number(a.progress));
    const meIdx = sorted.findIndex((e) => e.salesperson_id === currentUserSalespersonId);
    const me = meIdx >= 0 ? sorted[meIdx] : null;
    const leader = sorted[0];
    const gap = me && leader && me.car_id !== leader.car_id
      ? (Number(leader.progress) - Number(me.progress)) * 100
      : null;
    const hour = new Date().getHours();
    const window = `${preferredHour}h-${preferredHour + 2}h`;
    const firstName = (me?.salesperson_name ?? 'Piloto').split(' ')[0];

    return {
      greeting: greetingFor(hour),
      pilotFirstName: firstName,
      rank: me ? meIdx + 1 : null,
      totalPilots: sorted.length,
      gapToLeaderPercent: gap,
      streakDays,
      goldenWindow: window,
      cta: gap !== null && gap < 5 ? 'A liderança está ao alcance.' : 'Hoje é dia de acelerar.',
    };
  }, [entries, currentUserSalespersonId, streakDays, preferredHour]);

  useEffect(() => {
    if (!data) return;
    if (force) { setOpen(true); return; }
    const lastShown = (() => {
      try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
    })();
    if (lastShown === todayKey()) return;
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [data, force]);

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, todayKey()); } catch { /* noop */ }
  };

  return { open, dismiss, data };
}
