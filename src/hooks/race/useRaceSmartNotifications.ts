import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { RaceLeaderboardEntry } from './useRaceLeaderboard';

const PREF_KEY = 'race_smart_notifications_enabled';

function isEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(PREF_KEY) === '1'; } catch { return false; }
}

interface Opts {
  entries: RaceLeaderboardEntry[];
  currentUserSalespersonId?: string;
  rivalSalespersonId?: string;
  seasonEndDate?: string;
}

/**
 * Notificações contextuais opt-in (default OFF).
 * Dispara toasts em três gatilhos: rival ultrapassou, perto do pódio,
 * última hora da corrida (próximas 60 min do fim).
 */
export function useRaceSmartNotifications({
  entries,
  currentUserSalespersonId,
  rivalSalespersonId,
  seasonEndDate,
}: Opts) {
  const prevRankRef = useRef<number | null>(null);
  const prevRivalAheadRef = useRef<boolean | null>(null);
  const lastHourFiredRef = useRef(false);
  const podiumFiredRef = useRef(false);

  useEffect(() => {
    if (!isEnabled() || !currentUserSalespersonId || entries.length === 0) return;

    const sorted = [...entries].sort((a, b) => Number(b.total_sales) - Number(a.total_sales));
    const meIdx = sorted.findIndex((e) => e.salesperson_id === currentUserSalespersonId);
    const me = meIdx >= 0 ? sorted[meIdx] : null;
    if (!me) return;
    const myRank = meIdx + 1;

    // 1. Rival ultrapassou
    if (rivalSalespersonId) {
      const rivalIdx = sorted.findIndex((e) => e.salesperson_id === rivalSalespersonId);
      const rivalAhead = rivalIdx >= 0 && rivalIdx < meIdx;
      if (
        prevRivalAheadRef.current === false &&
        rivalAhead &&
        prevRankRef.current !== null
      ) {
        const rival = sorted[rivalIdx];
        toast.warning(`🏎️ ${rival.salesperson_name.split(' ')[0]} te ultrapassou!`, {
          description: 'Hora de revidar.',
        });
      }
      prevRivalAheadRef.current = rivalAhead;
    }

    // 2. Perto do pódio (P4)
    if (myRank === 4 && !podiumFiredRef.current) {
      const p3 = sorted[2];
      const gap = Number(p3.total_sales) - Number(me.total_sales);
      toast.info(`🥉 Você está a R$ ${gap.toLocaleString('pt-BR')} do pódio`, {
        description: 'Mais uma venda forte e você sobe.',
      });
      podiumFiredRef.current = true;
    }

    prevRankRef.current = myRank;
  }, [entries, currentUserSalespersonId, rivalSalespersonId]);

  // 3. Última hora da corrida
  useEffect(() => {
    if (!isEnabled() || !seasonEndDate || lastHourFiredRef.current) return;
    const end = new Date(seasonEndDate).getTime();
    const now = Date.now();
    const msToEnd = end - now;
    if (msToEnd <= 0 || msToEnd > 60 * 60 * 1000) return;
    const t = window.setTimeout(() => {
      toast.error('⏱️ Última hora de corrida!', {
        description: 'Cada venda agora pode mudar o pódio.',
        duration: 8000,
      });
      lastHourFiredRef.current = true;
    }, Math.min(msToEnd, 5000));
    return () => window.clearTimeout(t);
  }, [seasonEndDate]);
}

export function setRaceNotificationsEnabled(enabled: boolean) {
  try { localStorage.setItem(PREF_KEY, enabled ? '1' : '0'); } catch { /* noop */ }
  window.dispatchEvent(new CustomEvent('race-smart-notif-change'));
}

export function getRaceNotificationsEnabled(): boolean {
  return isEnabled();
}
