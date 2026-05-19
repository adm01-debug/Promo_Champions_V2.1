import { useEffect, useRef } from 'react';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";
import type { RaceSoundType } from "@/hooks/race/useRaceSounds";

interface Params {
  leaderboard: RaceLeaderboardEntry[];
  mySalespersonId?: string;
  comboCount?: number;
  secondsToEnd?: number;
  play: (type: RaceSoundType) => void;
  muted: boolean;
}

const DEBOUNCE_MS = 800;
const CHECKPOINTS = [25, 50, 75, 100];

/**
 * Orquestrador de áudio contextual: conecta mudanças de estado da arena
 * a sons já implementados, com debounce por tipo para evitar spam.
 */
export function useRaceAudioEngine({
  leaderboard,
  mySalespersonId,
  comboCount,
  secondsToEnd,
  play,
  muted,
}: Params) {
  const lastPlayedRef = useRef<Record<string, number>>({});
  const prevComboRef = useRef<number | undefined>(undefined);
  const prevProgressRef = useRef<number | undefined>(undefined);
  const prevSecondsRef = useRef<number | undefined>(undefined);
  const prevRankRef = useRef<number | undefined>(undefined);
  const initializedRef = useRef(false);

  const tryPlay = (type: RaceSoundType) => {
    if (muted) return;
    const now = Date.now();
    const last = lastPlayedRef.current[type] ?? 0;
    if (now - last < DEBOUNCE_MS) return;
    lastPlayedRef.current[type] = now;
    play(type);
  };

  // Combo crescendo (≥3 → powerup)
  useEffect(() => {
    if (comboCount === undefined) return;
    const prev = prevComboRef.current;
    if (prev !== undefined && comboCount > prev && comboCount >= 3) {
      tryPlay('powerup');
    }
    prevComboRef.current = comboCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comboCount, muted]);

  // Checkpoint: 25/50/75/100% do progresso
  useEffect(() => {
    if (!mySalespersonId) return;
    const me = leaderboard.find((e) => e.salesperson_id === mySalespersonId);
    if (!me) return;
    const progress = Number(me.progress) || 0;
    const prev = prevProgressRef.current;
    if (prev !== undefined) {
      const crossed = CHECKPOINTS.find((cp) => prev < cp && progress >= cp);
      if (crossed !== undefined) {
        tryPlay(crossed === 100 ? 'victory' : 'checkpoint');
      }
    }
    prevProgressRef.current = progress;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboard, mySalespersonId, muted]);

  // Countdown final: últimos 5s
  useEffect(() => {
    if (secondsToEnd === undefined || secondsToEnd < 0) return;
    const prev = prevSecondsRef.current;
    if (prev !== undefined && prev !== secondsToEnd && secondsToEnd <= 5 && secondsToEnd >= 1) {
      tryPlay('countdown');
    }
    prevSecondsRef.current = secondsToEnd;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsToEnd, muted]);

  // Rank up pessoal (subiu ≥1 posição)
  useEffect(() => {
    if (!mySalespersonId) return;
    const me = leaderboard.find((e) => e.salesperson_id === mySalespersonId);
    if (!me?.rank) return;
    const prev = prevRankRef.current;
    if (initializedRef.current && prev !== undefined && me.rank < prev) {
      tryPlay('boost');
    }
    prevRankRef.current = me.rank;
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboard, mySalespersonId, muted]);
}
