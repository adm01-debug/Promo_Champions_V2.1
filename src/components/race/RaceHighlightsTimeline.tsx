import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, Trophy, Zap, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

export interface RaceEvent {
  id: string;
  event_type: string;
  salesperson_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Props {
  events: RaceEvent[];
  cars: RaceLeaderboardEntry[];
  limit?: number;
}

const TYPE_META: Record<string, { icon: typeof Sparkles; label: string; tone: string }> = {
  victory: { icon: Trophy, label: 'Vitória', tone: 'text-coins' },
  overtake: { icon: TrendingUp, label: 'Ultrapassagem', tone: 'text-success' },
  boost: { icon: Zap, label: 'Boost', tone: 'text-streak' },
  leader_change: { icon: Crown, label: 'Novo líder', tone: 'text-primary' },
  checkpoint: { icon: Sparkles, label: 'Checkpoint', tone: 'text-accent' },
};

/**
 * Timeline lateral com top eventos da temporada (highlights).
 * Prioriza vitórias, ultrapassagens e mudanças de liderança.
 */
export function RaceHighlightsTimeline({ events, cars, limit = 5 }: Props) {
  const carById = useMemo(() => {
    const map = new Map<string, RaceLeaderboardEntry>();
    cars.forEach((c) => map.set(c.salesperson_id, c));
    return map;
  }, [cars]);

  const top = useMemo(() => {
    const priority = ['victory', 'leader_change', 'overtake', 'boost', 'checkpoint'];
    return [...events]
      .sort((a, b) => {
        const pa = priority.indexOf(a.event_type);
        const pb = priority.indexOf(b.event_type);
        if (pa !== pb) return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, limit);
  }, [events, limit]);

  if (top.length === 0) return null;

  return (
    <Card>
      <CardHeader className="py-2.5 px-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden />
          Highlights da temporada
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3 px-3">
        <ul className="space-y-2 relative" aria-label="Eventos em destaque">
          <span className="absolute left-2 top-2 bottom-2 w-px bg-border" aria-hidden />
          {top.map((ev, idx) => {
            const meta = TYPE_META[ev.event_type] ?? { icon: Sparkles, label: ev.event_type, tone: 'text-muted-foreground' };
            const Icon = meta.icon;
            const car = carById.get(ev.salesperson_id);
            return (
              <motion.li
                key={ev.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative pl-6 text-xs"
              >
                <span className={`absolute left-0 top-0.5 w-4 h-4 rounded-full bg-background border-2 border-current flex items-center justify-center ${meta.tone}`}>
                  <Icon className="w-2.5 h-2.5" aria-hidden />
                </span>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-foreground truncate">
                    {car?.salesperson_name?.split(' ')[0] ?? '—'}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(ev.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{meta.label}</p>
              </motion.li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
