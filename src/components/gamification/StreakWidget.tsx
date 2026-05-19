import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Target } from "lucide-react";
import { useCurrentStreak, useStreakAchievements, getNextMilestone } from "@/hooks/gamification/useDailyStreakAchievements";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StreakWidgetProps {
  salespersonId?: string;
}

function _StreakWidget({ salespersonId }: StreakWidgetProps) {
  const { data: currentStreak, isLoading: streakLoading } = useCurrentStreak(salespersonId);
  const { data: achievements, isLoading: achievementsLoading } = useStreakAchievements(salespersonId);

  const streak = currentStreak ?? 0;

  // Generate 7-day mini heatmap data (must be before early returns)
  const weekDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dayLabel = format(date, "EEE", { locale: ptBR }).charAt(0).toUpperCase();
      const isActive = streak > 0 && (6 - i) < streak;
      const isToday = i === 6;
      return { dayLabel, isActive, isToday };
    });
  }, [streak]);

  if (streakLoading || achievementsLoading) {
    return (
      <Card className="bg-gradient-to-br from-streak/10 via-destructive/5 to-coins/10 border-streak/20">
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const achievedTypes = achievements?.map(a => a.streak_type) || [];
  const nextMilestone = getNextMilestone(streak, achievedTypes);
  
  const progressToNext = nextMilestone 
    ? Math.min((streak / nextMilestone.days) * 100, 100)
    : 100;

  const daysToNext = nextMilestone ? nextMilestone.days - streak : 0;

  return (
    <Card className="bg-gradient-to-br from-streak/10 via-destructive/5 to-coins/10 border-streak/20 overflow-hidden relative h-full">
      {/* Animated fire glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-streak/5 to-transparent pointer-events-none" />
      
      <CardContent className="p-4 relative flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                scale: streak > 0 ? [1, 1.1, 1] : 1,
                rotate: streak > 0 ? [0, -5, 5, 0] : 0
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Flame className={`h-5 w-5 ${streak > 0 ? 'text-streak' : 'text-muted-foreground'}`} />
            </motion.div>
            <span className="text-sm font-medium text-foreground">Streak Diário</span>
          </div>
          
          {achievements && achievements.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-rank-gold">
              <Trophy className="h-3.5 w-3.5" />
              <span>{achievements.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <motion.span 
              className="text-3xl font-bold text-streak"
              key={streak}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {streak}
            </motion.span>
            <span className="text-sm text-muted-foreground">
              {streak === 1 ? 'dia' : 'dias'}
            </span>
          </div>

          {nextMilestone && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>Próximo: {nextMilestone.days}d</span>
            </div>
          )}
        </div>

        {nextMilestone && (
          <div className="space-y-1">
            <Progress 
              value={progressToNext} 
              className="h-2 bg-streak/10"
            />
            <p className="text-xs text-muted-foreground text-center">
              {daysToNext > 0 
                ? `Faltam ${daysToNext} ${daysToNext === 1 ? 'dia' : 'dias'} para ${nextMilestone.title}`
                : `${nextMilestone.title} desbloqueado!`
              }
            </p>
          </div>
        )}

        {/* 7-Day Mini Heatmap */}
        <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-streak/10">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-5 w-5 rounded-md transition-colors",
                  day.isActive ? "bg-streak/60" : "bg-muted/30",
                  day.isToday && "ring-1 ring-streak/50"
                )}
              />
              <span className="text-[9px] text-muted-foreground/70">{day.dayLabel}</span>
            </div>
          ))}
        </div>
        {!nextMilestone && streak > 0 && (
          <p className="text-xs text-center text-rank-gold font-medium">
            🏆 Todas as conquistas de streak alcançadas!
          </p>
        )}

        {/* Motivational filler for zero-state */}
        {streak === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 mt-2 pt-3 border-t border-streak/10">
            <div className="relative">
              <div className="flex gap-1.5 items-end">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-full bg-gradient-to-t from-streak/25 to-streak/10"
                    style={{ height: `${8 + i * 3}px` }}
                    animate={{ opacity: [0.3, 0.8, 0.3], scaleY: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
              </div>
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="h-3.5 w-3.5 text-streak/40" />
              </motion.div>
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-[11px] font-medium text-foreground/70">
                Comece sua sequência hoje!
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Registre atividades diárias para construir seu streak 🔥
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const StreakWidget = React.memo(_StreakWidget);
