import { useState } from 'react';
import { ChevronDown, Users2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useRaceTeams } from '@/hooks/race/useRaceTeams';
import { fmtCompact } from './raceFormatters';

interface Props {
  seasonId?: string;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Ranking colapsável de escuderias da temporada.
 */
export function TeamLeaderboard({ seasonId, defaultOpen = false, className }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const { data: teams = [], isLoading } = useRaceTeams(seasonId);

  if (!isLoading && teams.length === 0) return null;

  return (
    <Card variant="modern" className={cn('overflow-hidden', className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 p-3 hover:bg-muted/40 transition-colors"
            aria-label="Alternar Escuderias"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <Users2 className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-sm leading-none">🏎️ Escuderias</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {isLoading ? '…' : `${teams.length} equipe${teams.length === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul role="list" aria-label="Ranking de escuderias" className="px-3 pb-3 space-y-1.5">
            {teams.map((t, i) => (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2 p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors"
                aria-label={`Equipe ${t.name} em ${i + 1}º lugar com ${t.total_points} pontos`}
              >
                <span className="text-[11px] font-mono font-bold text-muted-foreground tabular-nums w-4">
                  {i + 1}
                </span>
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-[10px]"
                  style={{ background: t.color_primary, color: t.color_secondary }}
                  aria-hidden
                >
                  {t.emoji ?? '🏁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t.member_count} piloto{t.member_count === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="text-xs font-display font-black tabular-nums">
                  {fmtCompact(t.total_points)}
                </span>
              </motion.li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
