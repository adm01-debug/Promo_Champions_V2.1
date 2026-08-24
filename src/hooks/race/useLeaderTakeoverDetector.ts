import { useEffect, useRef, useState, useCallback } from 'react';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";

export interface TakeoverEvent {
  id: string;
  salespersonName: string;
  primaryColor: string;
  secondaryColor: string;
  timestamp: number;
}

/**
 * Detecta quando o usuário logado assume P1 da season (transição para liderança).
 * Ignora primeiro snapshot para evitar falso positivo no mount.
 */
export function useLeaderTakeoverDetector(
  entries: RaceLeaderboardEntry[],
  currentUserSalespersonId?: string,
) {
  const prevLeaderIdRef = useRef<string | null | undefined>(undefined);
  const [takeover, setTakeover] = useState<TakeoverEvent | null>(null);

  const clear = useCallback(() => setTakeover(null), []);

  useEffect(() => {
    if (entries.length === 0 || !currentUserSalespersonId) return;
    const sorted = [...entries].sort((a, b) => Number(b.progress) - Number(a.progress));
    const leader = sorted[0];
    const leaderId = leader.salesperson_id;

    // Primeiro snapshot: apenas registra, não dispara
    if (prevLeaderIdRef.current === undefined) {
      prevLeaderIdRef.current = leaderId;
      return;
    }

    const prevLeader = prevLeaderIdRef.current;
    if (
      leaderId === currentUserSalespersonId &&
      prevLeader !== currentUserSalespersonId
    ) {
      setTakeover({
        id: `takeover-${Date.now()}`,
        salespersonName: leader.salesperson_name,
        primaryColor: leader.primary_color,
        secondaryColor: leader.secondary_color,
        timestamp: Date.now(),
      });
    }
    prevLeaderIdRef.current = leaderId;
  }, [entries, currentUserSalespersonId]);

  return { takeover, clear };
}
