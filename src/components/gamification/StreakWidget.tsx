import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Target } from "lucide-react";
import { useCurrentStreak, useStreakAchievements, getNextMilestone } from "@/hooks/useDailyStreakAchievements";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface StreakWidgetProps {
  salespersonId?: string;
}

export function StreakWidget({ salespersonId }: StreakWidgetProps) {
  const { data: currentStreak, isLoading: streakLoading } = useCurrentStreak(salespersonId);
  const { data: achievements, isLoading: achievementsLoading } = useStreakAchievements(salespersonId);

  if (streakLoading || achievementsLoading) {
    return (
      <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/5 to-yellow-500/10 border-orange-500/20">
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const streak = currentStreak ?? 0;
  const achievedTypes = achievements?.map(a => a.streak_type) || [];
  const nextMilestone = getNextMilestone(streak, achievedTypes);
  
  const progressToNext = nextMilestone 
    ? Math.min((streak / nextMilestone.days) * 100, 100)
    : 100;

  const daysToNext = nextMilestone ? nextMilestone.days - streak : 0;

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/5 to-yellow-500/10 border-orange-500/20 overflow-hidden relative">
      {/* Animated fire glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
      
      <CardContent className="p-4 relative">
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
              <Flame className={`h-5 w-5 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </motion.div>
            <span className="text-sm font-medium text-foreground">Streak Diário</span>
          </div>
          
          {achievements && achievements.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <Trophy className="h-3.5 w-3.5" />
              <span>{achievements.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <motion.span 
              className="text-3xl font-bold text-orange-500"
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
              className="h-2 bg-orange-500/10"
            />
            <p className="text-xs text-muted-foreground text-center">
              {daysToNext > 0 
                ? `Faltam ${daysToNext} ${daysToNext === 1 ? 'dia' : 'dias'} para ${nextMilestone.title}`
                : `${nextMilestone.title} desbloqueado!`
              }
            </p>
          </div>
        )}

        {!nextMilestone && streak > 0 && (
          <p className="text-xs text-center text-amber-500 font-medium">
            🏆 Todas as conquistas de streak alcançadas!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
