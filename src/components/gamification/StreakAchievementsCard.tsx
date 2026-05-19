import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Lock, CheckCircle, Gift } from "lucide-react";
import { motion } from "framer-motion";
import {
  useCurrentStreak,
  useStreakAchievements,
  STREAK_MILESTONES,
  getNextMilestone,
} from "@/hooks/gamification/useDailyStreakAchievements";

interface StreakAchievementsCardProps {
  salespersonId?: string;
  compact?: boolean;
}

function _StreakAchievementsCard({ salespersonId, compact = false }: StreakAchievementsCardProps) {
  const { data: currentStreak, isLoading: streakLoading } = useCurrentStreak(salespersonId);
  const { data: achievements, isLoading: achievementsLoading } = useStreakAchievements(salespersonId);

  const isLoading = streakLoading || achievementsLoading;
  const achievedTypes = achievements?.map(a => a.streak_type) || [];
  const nextMilestone = getNextMilestone(currentStreak || 0, achievedTypes);

  if (isLoading) {
    return (
      <Card className={compact ? "h-full" : ""}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className={compact ? "pb-2" : ""}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-streak" />
          Conquistas de Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="bg-gradient-to-r from-streak/10 via-destructive/10 to-rank-gold/10 rounded-xl p-4 border border-streak/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-streak to-destructive flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-primary-foreground">{currentStreak || 0}</span>
              </div>
              {(currentStreak || 0) > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-rank-gold flex items-center justify-center text-sm"
                >
                  🔥
                </motion.div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Streak Atual</p>
              <p className="text-xl font-bold">
                {currentStreak || 0} {(currentStreak || 0) === 1 ? 'dia' : 'dias'} consecutivos
              </p>
              {nextMilestone && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Próxima conquista: {nextMilestone.title}</span>
                    <span>{currentStreak || 0}/{nextMilestone.days} dias</span>
                  </div>
                  <Progress 
                    value={((currentStreak || 0) / nextMilestone.days) * 100} 
                    className="h-1.5"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Milestones Grid */}
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-3`}>
          {STREAK_MILESTONES.map((milestone) => {
            const isAchieved = achievedTypes.includes(milestone.type);
            
            return (
              <motion.div
                key={milestone.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-lg border p-3 text-center transition-all ${
                  isAchieved 
                    ? 'bg-gradient-to-br from-rank-gold/10 to-streak/10 border-rank-gold/30' 
                    : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className={`text-3xl mb-1 ${isAchieved ? '' : 'grayscale'}`}>
                  {milestone.icon}
                </div>
                <p className={`text-xs font-medium ${isAchieved ? '' : 'text-muted-foreground'}`}>
                  {milestone.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {milestone.days} dias
                </p>
                <Badge 
                  variant={isAchieved ? "default" : "secondary"}
                  className={`mt-1 text-[10px] ${isAchieved ? 'bg-rank-gold/20 text-rank-gold dark:text-rank-gold border-rank-gold/30' : ''}`}
                >
                  <Gift className="h-2.5 w-2.5 mr-0.5" />
                  {milestone.xp} XP
                </Badge>
                
                {isAchieved ? (
                  <div className="absolute top-1 right-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                ) : (
                  <div className="absolute top-1 right-1">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Achievement List (non-compact only) */}
        {!compact && achievements && achievements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Conquistas Desbloqueadas</p>
            {achievements.map((achievement) => {
              const milestoneInfo = STREAK_MILESTONES.find(m => m.type === achievement.streak_type);
              if (!milestoneInfo) return null;
              
              return (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-2"
                >
                  <span className="text-2xl">{milestoneInfo.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{milestoneInfo.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(achievement.achieved_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-rank-gold/20 text-rank-gold">
                    +{achievement.xp_awarded} XP
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const StreakAchievementsCard = React.memo(_StreakAchievementsCard);
