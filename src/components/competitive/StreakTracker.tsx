import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSalesStreaks } from '@/hooks/sales/useSalesStreaks';

const STREAK_TIERS = [
  { min: 10, label: 'Lendário', emoji: '🔥🔥🔥', multiplier: '3x XP', color: 'text-destructive' },
  { min: 5, label: 'On Fire', emoji: '🔥🔥', multiplier: '2x XP', color: 'text-streak' },
  { min: 2, label: 'Esquentando', emoji: '🔥', multiplier: '1.5x XP', color: 'text-warning' },
  { min: 0, label: 'Início', emoji: '❄️', multiplier: '1x XP', color: 'text-muted-foreground' },
];

function getStreakTier(streak: number) {
  return STREAK_TIERS.find(t => streak >= t.min) || STREAK_TIERS[STREAK_TIERS.length - 1];
}

interface StreakTrackerProps {
  className?: string;
}

const StreakTrackerComponent: FC<StreakTrackerProps> = ({ className }) => {
  const { data: streaks, isLoading } = useSalesStreaks();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  const activeStreaks = streaks?.filter(s => s.current_streak > 0) || [];
  const inactive = streaks?.filter(s => s.current_streak === 0) || [];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Streak leaderboard */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-streak to-destructive flex items-center justify-center">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            Streak de Vendas
            <Badge variant="outline" className="text-xs ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              Multiplicador de XP
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Multiplier legend */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-border/20">
            {STREAK_TIERS.slice(0, 3).map(tier => (
              <div key={tier.min} className="flex items-center gap-1.5 text-xs">
                <span>{tier.emoji}</span>
                <span className="text-muted-foreground">{tier.min}+ dias = <strong className={tier.color}>{tier.multiplier}</strong></span>
              </div>
            ))}
          </div>

          {activeStreaks.length > 0 ? (
            activeStreaks.map((s, i) => {
              const tier = getStreakTier(s.current_streak);
              return (
                <motion.div
                  key={s.salesperson_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    s.current_streak >= 10 && 'bg-gradient-to-r from-destructive/10 to-streak/5 border-destructive/30',
                    s.current_streak >= 5 && s.current_streak < 10 && 'bg-gradient-to-r from-streak/10 to-warning/5 border-streak/30',
                    s.current_streak >= 2 && s.current_streak < 5 && 'bg-gradient-to-r from-warning/10 to-coins/5 border-warning/30',
                  )}
                >
                  <Avatar className="h-9 w-9 border-2 border-background shadow">
                    <AvatarImage src={s.avatar_url || undefined} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {s.salesperson_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{s.salesperson_name}</span>
                      <span className="text-sm">{tier.emoji}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tier.label} • Recorde: {s.longest_streak} dias
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={cn('text-lg font-bold', tier.color)}>{s.current_streak}</p>
                    <p className="text-[10px] text-muted-foreground">dias seguidos</p>
                  </div>

                  <Badge variant="outline" className={cn('text-xs shrink-0', tier.color)}>
                    {tier.multiplier}
                  </Badge>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Flame className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Ninguém com streak ativo. Hora de começar! 🚀</p>
            </div>
          )}

          {inactive.length > 0 && activeStreaks.length > 0 && (
            <div className="pt-2 border-t border-border/20">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Sem streak ({inactive.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {inactive.slice(0, 5).map(s => (
                  <div key={s.salesperson_id} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg px-2 py-1">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[8px]">{s.salesperson_name[0]}</AvatarFallback>
                    </Avatar>
                    {s.salesperson_name.split(' ')[0]}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export const StreakTracker = React.memo(StreakTrackerComponent);
