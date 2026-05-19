import { useState, useCallback, useEffect } from 'react';

export interface RaceTickerEvent {
  id: string;
  text: string;
  icon?: string;
  at: number;
}

export interface BroadcastEvent {
  id: string;
  kind: 'gap' | 'overtake' | 'finale' | 'leader';
  title: string;
  detail: string;
}

export function useRaceDisplayEvents() {
  const [tickerEvents, setTickerEvents] = useState<RaceTickerEvent[]>([]);
  const [broadcastEvents, setBroadcastEvents] = useState<BroadcastEvent[]>([]);

  const pushTickerEvent = useCallback((text: string, icon?: string) => {
    setTickerEvents((prev) =>
      [{ id: `${Date.now()}-${Math.random()}`, text, icon, at: Date.now() }, ...prev].slice(0, 8),
    );
  }, []);

  const pushBroadcast = useCallback((evt: Omit<BroadcastEvent, 'id'>) => {
    setBroadcastEvents((prev) => {
      const id = `${Date.now()}-${Math.random()}`;
      return [{ id, ...evt }, ...prev].slice(0, 5);
    });
  }, []);

  // Auto-cleanup broadcast events > 60s
  useEffect(() => {
    const id = window.setInterval(() => {
      const cutoff = Date.now() - 60_000;
      setBroadcastEvents((prev) =>
        prev.filter((e) => Number(e.id.split('-')[0]) > cutoff),
      );
    }, 8_000);
    return () => window.clearInterval(id);
  }, []);

  return {
    tickerEvents,
    setTickerEvents,
    pushTickerEvent,
    broadcastEvents,
    setBroadcastEvents,
    pushBroadcast,
  };
}
