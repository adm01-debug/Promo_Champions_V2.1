import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Crown, Share2, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useChampionsHistory, type ChampionHistoryEntry } from '@/hooks/race/useChampionsHistory';
import type { RoleType } from '@/hooks/race/useRaceSeasonByRole';
import { SeasonRecapCard } from './SeasonRecapCard';
import { fmtCompact } from './raceFormatters';

interface Props {
  roleType?: RoleType;
  limit?: number;
  defaultOpen?: boolean;
  className?: string;
}

export function ChampionsHistoryPanel({ roleType, limit = 12, defaultOpen = true, className }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const prefersReduced = useReducedMotion();
  const { data: champions = [], isLoading } = useChampionsHistory(roleType, limit);

  return (
    <Card variant="modern" className={cn('overflow-hidden', className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/40 transition-colors"
            aria-label="Alternar Hall da Fama"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning/30 to-warning/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-warning" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-black text-base leading-none">🏆 Hall da Fama</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading ? 'Carregando…' : `${champions.length} campeão${champions.length === 1 ? '' : 'ões'}`}
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            {isLoading ? (
              <SkeletonList />
            ) : champions.length === 0 ? (
              <EmptyState />
            ) : (
              <ul role="list" aria-label="Campeões de temporadas anteriores" className="space-y-2">
                {champions.map((c, i) => (
                  <ChampionRow
                    key={c.seasonId}
                    entry={c}
                    isLatest={i === 0}
                    delay={prefersReduced ? 0 : Math.min(i * 0.05, 0.4)}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function ChampionRow({ entry, isLatest, delay }: { entry: ChampionHistoryEntry; isLatest: boolean; delay: number }) {
  const [shareOpen, setShareOpen] = useState(false);
  const initials = entry.championName.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return (
    <>
      <motion.li
        role="listitem"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.25 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-colors',
          isLatest
            ? 'bg-warning/5 border-warning/30 shadow-sm'
            : 'bg-card/50 border-border/40 hover:border-border'
        )}
      >
        <div className="relative shrink-0">
          <Avatar className={cn('w-11 h-11 ring-2', isLatest ? 'ring-warning' : 'ring-border')}>
            {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt={entry.championName} />}
            <AvatarFallback className="text-xs font-bold">{initials || '🏁'}</AvatarFallback>
          </Avatar>
          {isLatest && (
            <Crown className="absolute -top-2 -right-1 w-4 h-4 text-warning fill-warning drop-shadow" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{entry.championName}</p>
            {entry.carNumber != null && (
              <Badge variant="outline" className="h-4 px-1 text-[10px] font-mono shrink-0">
                #{entry.carNumber}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {entry.seasonName} · {format(new Date(entry.endDate), "dd 'de' MMM yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="font-display font-black text-sm tabular-nums">{fmtCompact(entry.totalSales)}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">pts</div>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={() => setShareOpen(true)}
          aria-label={`Compartilhar season ${entry.seasonName}`}
        >
          <Share2 className="w-3.5 h-3.5" aria-hidden />
        </Button>
      </motion.li>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar conquista</DialogTitle>
          </DialogHeader>
          <SeasonRecapCard
            championName={entry.championName}
            avatarUrl={entry.avatarUrl}
            seasonName={entry.seasonName}
            rank={1}
            totalSales={entry.totalSales}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
          <Skeleton className="w-11 h-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-6 w-12" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-6 px-4">
      <Trophy className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
      <p className="text-sm text-muted-foreground">
        Nenhuma temporada encerrada ainda — <span className="text-foreground font-medium">seja o primeiro lendário!</span>
      </p>
    </div>
  );
}
