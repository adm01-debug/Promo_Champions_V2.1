import { FC, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Rewind } from 'lucide-react';
import type { RaceEvent } from '@/hooks/race/useRaceEvents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: RaceEvent[];
  pilotNameById: Map<string, string>;
}

interface DayBucket {
  date: string;
  label: string;
  events: RaceEvent[];
  topMovers: { id: string; name: string; count: number }[];
}

/** Replay temporal scrubber: visualiza eventos da season agregados por dia. */
export const SeasonReplayModal: FC<Props> = ({ open, onOpenChange, events, pilotNameById }) => {
  const days = useMemo<DayBucket[]>(() => {
    if (!events.length) return [];
    const buckets = new Map<string, RaceEvent[]>();
    for (const ev of events) {
      const day = ev.created_at.slice(0, 10);
      if (!buckets.has(day)) buckets.set(day, []);
      buckets.get(day)!.push(ev);
    }
    return Array.from(buckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, evs]) => {
        const counts = new Map<string, number>();
        for (const e of evs) counts.set(e.salesperson_id, (counts.get(e.salesperson_id) ?? 0) + 1);
        const topMovers = [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id, count]) => ({ id, name: pilotNameById.get(id) ?? '—', count }));
        return {
          date,
          label: format(new Date(date), "dd 'de' MMM", { locale: ptBR }),
          events: evs,
          topMovers,
        };
      });
  }, [events, pilotNameById]);

  const [idx, setIdx] = useState(0);
  const current = days[Math.min(idx, days.length - 1)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Rewind className="w-5 h-5 text-primary" /> Replay da Temporada
          </DialogTitle>
        </DialogHeader>

        {days.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Sem eventos registrados para replay.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Dia {idx + 1} de {days.length}
                </span>
                <Badge variant="secondary">{current.label}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-display font-black">
                  {current.events.length} evento{current.events.length === 1 ? '' : 's'}
                </p>
                <div className="space-y-1">
                  {current.topMovers.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sem movimentações destacadas.</p>
                  ) : (
                    current.topMovers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{m.name}</span>
                        <span className="text-muted-foreground tabular-nums">{m.count}x</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Slider
              value={[idx]}
              min={0}
              max={Math.max(0, days.length - 1)}
              step={1}
              onValueChange={(v) => setIdx(v[0] ?? 0)}
              aria-label="Scrubber temporal"
            />
            <p className="text-[11px] text-muted-foreground text-center">
              Arraste para navegar dia-a-dia.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
