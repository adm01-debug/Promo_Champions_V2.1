import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RaceEventFeed } from './RaceEventFeed';
import type { RaceEvent } from '@/hooks/race/useRaceEvents';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';
import { cn } from '@/lib/utils';

interface Props {
  events: RaceEvent[];
  cars: RaceLeaderboardEntry[];
}

export function FloatingEventFeed({ events, cars }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const lastSeenIdRef = useRef<string | null>(events[0]?.id ?? null);

  useEffect(() => {
    if (!events.length) return;
    if (isOpen) {
      lastSeenIdRef.current = events[0].id;
      setUnread(0);
      return;
    }
    const idx = events.findIndex((e) => e.id === lastSeenIdRef.current);
    setUnread(idx === -1 ? events.length : idx);
  }, [events, isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="open"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="pointer-events-auto w-[340px] h-[420px] flex flex-col rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                Narração ao Vivo
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
                aria-label="Minimizar feed"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="h-full [&>div]:h-full [&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none [&_[data-slot=card-header]]:hidden">
                <RaceEventFeed events={events} cars={cars} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              'pointer-events-auto flex items-center gap-2 px-3.5 py-2.5 rounded-full',
              'bg-primary text-primary-foreground shadow-lg hover:shadow-xl',
              'border border-primary/30 transition-all hover:scale-105'
            )}
            aria-label="Abrir narração ao vivo"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wide">Narração</span>
            {unread > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold animate-pulse">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
