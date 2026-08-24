import { useCallback, useEffect, useRef, useState } from 'react';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

export interface ReplaySnapshot {
  at: number;
  positions: Array<{ id: string; progress: number }>;
}

interface UseRaceReplayResult {
  recordSnapshot: (cars: RaceLeaderboardEntry[]) => void;
  startReplay: () => void;
  isPlaying: boolean;
  /** Snapshot interpolado atual durante replay (ou null se não estiver tocando). */
  currentFrame: ReplaySnapshot | null;
  hasReplay: boolean;
}

const MAX_SNAPSHOTS = 10;
const REPLAY_DURATION_MS = 4000;

/**
 * Mantém ring buffer com últimas 10 posições + permite reproduzir
 * em ~4s com easing acelerado. Disparado por RaceReplayButton.
 */
export function useRaceReplay(): UseRaceReplayResult {
  const buffer = useRef<ReplaySnapshot[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<ReplaySnapshot | null>(null);
  const rafRef = useRef<number | null>(null);

  const recordSnapshot = useCallback((cars: RaceLeaderboardEntry[]) => {
    if (isPlaying) return;
    const snap: ReplaySnapshot = {
      at: Date.now(),
      positions: cars.map((c) => ({ id: c.car_id, progress: Number(c.progress) })),
    };
    buffer.current = [...buffer.current, snap].slice(-MAX_SNAPSHOTS);
  }, [isPlaying]);

  const startReplay = useCallback(() => {
    const snaps = buffer.current;
    if (snaps.length < 2 || isPlaying) return;
    setIsPlaying(true);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / REPLAY_DURATION_MS);
      // Easing acelerado: ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const idxFloat = eased * (snaps.length - 1);
      const idxLow = Math.floor(idxFloat);
      const idxHigh = Math.min(snaps.length - 1, idxLow + 1);
      const frac = idxFloat - idxLow;
      const a = snaps[idxLow];
      const b = snaps[idxHigh];
      const positions = a.positions.map((p) => {
        const bp = b.positions.find((x) => x.id === p.id);
        const prog = bp ? p.progress + (bp.progress - p.progress) * frac : p.progress;
        return { id: p.id, progress: prog };
      });
      setCurrentFrame({ at: a.at, positions });

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
        setCurrentFrame(null);
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [isPlaying]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return {
    recordSnapshot,
    startReplay,
    isPlaying,
    currentFrame,
    hasReplay: buffer.current.length >= 2,
  };
}
