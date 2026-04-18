import { motion } from 'framer-motion';
import { Crown, Target, TrendingUp, Flag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';
import { useNextGoal } from '@/hooks/race/useNextGoal';
import { ComboStreakBadge } from './ComboStreakBadge';

interface Props {
  entries: RaceLeaderboardEntry[];
  currentUserSalespersonId?: string;
  goalAmount: number;
  seasonStart?: string;
  seasonEnd?: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
}

export function NextGoalPanel({
  entries,
  currentUserSalespersonId,
  goalAmount,
  seasonStart,
  seasonEnd,
}: Props) {
  const goal = useNextGoal(entries, currentUserSalespersonId, goalAmount);
  const animatedGap = useCountUp(goal.gapAmount, { duration: 900 });
  const animatedSeason = useCountUp(goal.seasonProgress, { duration: 900, decimals: 1 });

  if (goal.mode === 'idle') {
    return (
      <Card className="p-3 border-dashed border-muted-foreground/30 bg-muted/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Flag className="w-4 h-4" />
          <span>Entre na pista para ver sua próxima meta.</span>
        </div>
      </Card>
    );
  }

  const isHunting = goal.mode === 'hunting';
  const isDefending = goal.mode === 'defending';
  const isLeaderOnly = goal.mode === 'leader-only';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      aria-live="polite"
    >
      <Card
        className={cn(
          'relative overflow-hidden p-3 bg-gradient-to-br from-primary/10 via-card to-card border-primary/20',
          goal.isCloseToOvertake && 'border-warning/60 shadow-[0_0_18px_-4px_hsl(var(--warning)/0.5)]',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {isHunting && <Target className="w-3.5 h-3.5 text-primary" />}
            {isDefending && <Crown className="w-3.5 h-3.5 text-warning" />}
            {isLeaderOnly && <Crown className="w-3.5 h-3.5 text-warning" />}
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {isHunting && 'Caçando posição'}
              {isDefending && 'Defendendo P1'}
              {isLeaderOnly && 'Líder absoluto'}
            </span>
          </div>
          <span className="text-[10px] font-bold tabular-nums text-primary">
            {goal.me?.rank ? `P${goal.me.rank}` : ''}
          </span>
        </div>

        {/* Target / message */}
        {(isHunting || isDefending) && goal.target && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-7 h-7 border-2 border-background">
              <AvatarImage src={goal.target.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {goal.target.salesperson_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground leading-tight">
                {isHunting ? 'Próximo alvo' : 'Perseguidor'}
              </p>
              <p className="text-xs font-semibold truncate font-display">
                {goal.target.salesperson_name}
              </p>
            </div>
          </div>
        )}

        {isLeaderOnly && (
          <p className="text-xs text-muted-foreground mb-2">
            Sem perseguidores. Mantenha o ritmo!
          </p>
        )}

        {/* Gap amount */}
        {(isHunting || isDefending) && (
          <motion.div
            animate={goal.isCloseToOvertake ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="mb-2"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {isHunting ? 'Falta para ultrapassar' : 'Vantagem atual'}
            </p>
            <p
              className={cn(
                'text-xl font-black font-display tabular-nums leading-tight',
                isHunting ? 'text-primary' : 'text-success',
              )}
            >
              {fmt(animatedGap)}
            </p>
            {/* Progress bar */}
            <div className="mt-1.5 h-1.5 rounded-full bg-muted/60 overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  isHunting
                    ? 'bg-gradient-to-r from-primary to-warning'
                    : 'bg-gradient-to-r from-success to-warning',
                )}
                initial={{ width: 0 }}
                animate={{ width: `${goal.gapPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
              {Math.round(goal.gapPercent)}% {isHunting ? 'do alvo' : 'da sua marca'}
            </p>
          </motion.div>
        )}

        {/* Season goal */}
        {goalAmount > 0 && (
          <div className="pt-2 mt-2 border-t border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                Meta da temporada
              </span>
              <span className="text-[10px] font-bold tabular-nums text-foreground">
                {animatedSeason.toFixed(1)}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${goal.seasonProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
              Faltam {fmt(goal.seasonRemaining)}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
