import { useEffect, useRef, useState, useCallback } from 'react';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";

export interface OvertakeEvent {
  id: string;
  overtaker: RaceLeaderboardEntry;
  overtaken: RaceLeaderboardEntry;
  overtakerOldRank: number;
  overtakerNewRank: number;
  overtakenOldRank: number;
  overtakenNewRank: number;
  timestamp: number;
}

const AUTO_DISMISS_MS = 5500;
const MAX_QUEUE = 2;

/**
 * Detecta ultrapassagens comparando snapshots consecutivos do leaderboard.
 * Ignora o primeiro snapshot para evitar falsos positivos no mount.
 */
export function useOvertakeDetector(entries: RaceLeaderboardEntry[]) {
  const prevRanksRef = useRef<Map<string, number> | null>(null);
  const [recentOvertakes, setRecentOvertakes] = useState<OvertakeEvent[]>([]);

  const dismissOvertake = useCallback((id: string) => {
    setRecentOvertakes((prev) => prev.filter((o) => o.id !== id));
  }, []);

  useEffect(() => {
    if (entries.length === 0) return;
    const sorted = [...entries].sort((a, b) => Number(b.progress) - Number(a.progress));
    const currentRanks = new Map(sorted.map((e, i) => [e.salesperson_id, i + 1]));

    if (prevRanksRef.current === null) {
      prevRanksRef.current = currentRanks;
      return;
    }

    const prev = prevRanksRef.current;
    const newOvertakes: OvertakeEvent[] = [];
    const byId = new Map(entries.map((e) => [e.salesperson_id, e]));

    currentRanks.forEach((newRank, id) => {
      const oldRank = prev.get(id);
      if (oldRank === undefined || newRank >= oldRank) return;
      // Subiu: encontrar quem caiu para a posição do overtaker
      currentRanks.forEach((otherNewRank, otherId) => {
        if (otherId === id) return;
        const otherOldRank = prev.get(otherId);
        if (otherOldRank === undefined) return;
        if (otherOldRank === newRank && otherNewRank > otherOldRank) {
          const overtaker = byId.get(id);
          const overtaken = byId.get(otherId);
          if (!overtaker || !overtaken) return;
          newOvertakes.push({
            id: `${id}-${otherId}-${Date.now()}`,
            overtaker,
            overtaken,
            overtakerOldRank: oldRank,
            overtakerNewRank: newRank,
            overtakenOldRank: otherOldRank,
            overtakenNewRank: otherNewRank,
            timestamp: Date.now(),
          });
        }
      });
    });

    if (newOvertakes.length > 0) {
      setRecentOvertakes((prevQueue) => [...newOvertakes, ...prevQueue].slice(0, MAX_QUEUE));
    }
    prevRanksRef.current = currentRanks;
  }, [entries]);

  useEffect(() => {
    if (recentOvertakes.length === 0) return;
    const timers = recentOvertakes.map((o) =>
      setTimeout(() => dismissOvertake(o.id), AUTO_DISMISS_MS - (Date.now() - o.timestamp))
    );
    return () => { timers.forEach(clearTimeout); };
  }, [recentOvertakes, dismissOvertake]);

  return { recentOvertakes, dismissOvertake };
}
