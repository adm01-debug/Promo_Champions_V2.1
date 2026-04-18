import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Flag, Star, Trophy, Wrench, Sparkles, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RaceEvent } from '@/hooks/race/useRaceEvents';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

const EVENT_META: Record<RaceEvent['event_type'], { icon: React.ComponentType<{ className?: string }>; color: string; label: (m: Record<string, unknown>, name: string) => string }> = {
  boost: { icon: Zap, color: 'text-orange-500', label: (_m, n) => `${n} acelerou! 🏎️💨` },
  overtake: { icon: Sparkles, color: 'text-fuchsia-500', label: (m, n) => `${n} ultrapassou ${(m.overtaken_name as string) ?? 'rival'}!` },
  checkpoint: { icon: Flag, color: 'text-yellow-500', label: (m, n) => `${n} cruzou checkpoint ${m.checkpoint ?? ''}%` },
  powerup: { icon: Star, color: 'text-cyan-500', label: (m, n) => `${n} pegou ${(m.powerup_type as string) ?? 'power-up'}!` },
  victory: { icon: Trophy, color: 'text-yellow-500', label: (_m, n) => `🏆 ${n} venceu a corrida!` },
  pitstop: { icon: Wrench, color: 'text-slate-500', label: (_m, n) => `${n} entrou no boxe...` },
};

interface Props {
  events: RaceEvent[];
  cars: RaceLeaderboardEntry[];
}

export function RaceEventFeed({ events, cars }: Props) {
  const nameOf = (id: string) => cars.find((c) => c.salesperson_id === id)?.salesperson_name?.split(' ')[0] ?? 'Piloto';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Radio className="w-5 h-5 text-primary animate-pulse" />
          Narração ao Vivo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-1.5">
        <AnimatePresence initial={false}>
          {events.map((e) => {
            const meta = EVENT_META[e.event_type];
            const Icon = meta.icon;
            return (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-2 rounded-md bg-muted/40 text-sm"
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${meta.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="leading-tight">{meta.label(e.metadata, nameOf(e.salesperson_id))}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Aguardando ação na pista... 🏁</p>
        )}
      </CardContent>
    </Card>
  );
}
