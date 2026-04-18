import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RaceEvent } from '@/hooks/race/useRaceEvents';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

interface VictoryLapOverlayProps {
  events: RaceEvent[];
  cars: RaceLeaderboardEntry[];
  onPlaySound?: () => void;
}

export function VictoryLapOverlay({ events, cars, onPlaySound }: VictoryLapOverlayProps) {
  const [open, setOpen] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const victory = events.find((e) => e.event_type === 'victory' && !seenIds.has(e.id));
    if (victory) {
      setWinnerId(victory.salesperson_id);
      setOpen(true);
      onPlaySound?.();
      setSeenIds((prev) => new Set(prev).add(victory.id));
    }
  }, [events, seenIds, onPlaySound]);

  const winner = cars.find((c) => c.salesperson_id === winnerId);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          {/* confete SVG procedural */}
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 1, rotate: 0 }}
              animate={{ y: window.innerHeight + 50, rotate: 720 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="absolute w-2 h-3 rounded-sm"
              style={{ background: ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#a855f7'][i % 5] }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="relative bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-amber-200"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-amber-900 hover:bg-amber-200"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: 2 }}
              className="inline-block"
            >
              <Trophy className="w-24 h-24 text-amber-900 mx-auto drop-shadow-lg" />
            </motion.div>
            <h2 className="text-3xl font-black text-amber-950 mt-3">🏁 VENCEDOR! 🏁</h2>
            <p className="text-xl font-bold text-amber-900 mt-2">{winner?.salesperson_name ?? 'Piloto'}</p>
            {winner && (
              <p className="text-sm text-amber-800 mt-1">
                Carro #{winner.car_number} · {winner.deals_count} vendas
              </p>
            )}
            <p className="text-amber-900/80 mt-4 text-sm">Bandeira quadriculada! 🏆 Volta da vitória!</p>
            <Button onClick={() => setOpen(false)} className="mt-6 bg-amber-900 text-amber-50 hover:bg-amber-800">
              Continuar corrida
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
