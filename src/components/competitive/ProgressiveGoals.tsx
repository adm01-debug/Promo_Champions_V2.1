import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Zap, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useProgressiveGoals } from '@/hooks/useProgressiveGoals';

interface ProgressiveGoalsProps {
  salespersonId?: string;
}

const LEVEL_COLORS: Record<number, string> = {
  1: 'from-gray-400 to-gray-500',
  2: 'from-success to-success/80',
  3: 'from-info to-info/80',
  4: 'from-primary to-primary-glow',
  5: 'from-rank-gold to-rank-gold/80',
  6: 'from-destructive to-destructive/80',
  7: 'from-accent to-secondary',
  8: 'from-coins to-coins/80',
  9: 'from-accent to-accent/80',
  10: 'from-primary-glow to-primary',
};

const ProgressiveGoalsComponent: FC<ProgressiveGoalsProps> = ({ salespersonId }) => {
  const { goals, isLoading, getLabel, getLevelTitle } = useProgressiveGoals(salespersonId);

  if (isLoading) {
    return <div className="space-y-3">
      {[1, 2].map(i => <div key={i} className="h-28 rounded-xl bg-muted/30 animate-pulse" />)}
    </div>;
  }

  if (!goals.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Target className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-foreground">Metas Progressivas</p>
          <p className="text-xs text-muted-foreground mt-1">
            Suas metas se adaptam automaticamente ao seu desempenho. Complete vendas para iniciar!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-accent/10 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Target className="h-4 w-4 text-primary-foreground" />
              </div>
              Metas Progressivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Suas metas escalam conforme você evolui. A cada nível, o desafio aumenta!
            </p>
          </CardContent>
        </div>
      </Card>

      {goals.map((goal, i) => {
        const label = getLabel(goal.goal_type);
        const levelTitle = getLevelTitle(goal.current_level);
        const pct = goal.current_target > 0 ? Math.min(100, Math.round((goal.current_progress / goal.current_target) * 100)) : 0;
        const nextTarget = Math.round(goal.current_target * goal.multiplier);
        const levelColor = LEVEL_COLORS[Math.min(goal.current_level, 10)] || LEVEL_COLORS[1];

        return (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-md overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{label.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{label.label}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge className={cn('text-[10px] h-4 bg-gradient-to-r text-primary-foreground border-0', levelColor)}>
                          Nv.{goal.current_level} • {levelTitle}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-accent">
                      <Zap className="h-3 w-3" />
                      {goal.total_xp_earned} XP total
                    </div>
                    <p className="text-[10px] text-muted-foreground">{goal.completed_levels} níveis concluídos</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {label.unit}{goal.current_progress.toLocaleString('pt-BR')}
                    </span>
                    <span className="font-semibold text-foreground">
                      Meta: {label.unit}{goal.current_target.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <Progress value={pct} className="h-3" />
                  <p className="text-[10px] text-muted-foreground text-center">{pct}%</p>
                </div>

                {/* Next level preview */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/20">
                  <ChevronUp className="h-4 w-4 text-accent" />
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Próximo nível</p>
                    <p className="text-xs font-medium text-foreground">
                      {label.unit}{nextTarget.toLocaleString('pt-BR')} ({goal.multiplier}x)
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};


export const ProgressiveGoals = React.memo(ProgressiveGoalsComponent);
