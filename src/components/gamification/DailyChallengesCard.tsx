import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";
import {
  useDailyChallengesWithProgress,
  useClaimDailyChallengeReward,
  getDailyChallengeIcon,
  getDailyChallengeColor,
} from "@/hooks/useDailyChallenges";

interface DailyChallengesCardProps {
  salespersonId?: string;
  compact?: boolean;
}

export function DailyChallengesCard({ salespersonId, compact = false }: DailyChallengesCardProps) {
  const { data: challenges, isLoading } = useDailyChallengesWithProgress(salespersonId);
  const claimReward = useClaimDailyChallengeReward();

  const handleClaimReward = (challengeId: string, xpReward: number) => {
    if (!salespersonId) return;
    claimReward.mutate({ challengeId, salespersonId, xpReward });
  };

  if (isLoading) {
    return (
      <Card className={compact ? "h-full" : ""}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <Card className={compact ? "h-full" : ""}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-amber-500" />
            Desafios do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Novos desafios serão gerados em breve!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = challenges.filter(c => c.isCompleted).length;
  const totalXP = challenges.reduce((sum, c) => sum + c.xp_reward, 0);

  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className={compact ? "pb-2" : ""}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-amber-500" />
            Desafios do Dia
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{challenges.length} • {totalXP} XP
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge, index) => {
          const canClaim = challenge.isCompleted && !challenge.progress?.xp_claimed;
          const isClaimed = challenge.progress?.xp_claimed;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-lg border p-3 ${
                isClaimed 
                  ? 'bg-muted/50 border-muted' 
                  : challenge.isCompleted 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-card'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${getDailyChallengeColor(challenge.challenge_type)} text-white text-lg shrink-0`}>
                  {getDailyChallengeIcon(challenge.challenge_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-medium text-sm truncate ${isClaimed ? 'line-through text-muted-foreground' : ''}`}>
                      {challenge.title}
                    </h4>
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      +{challenge.xp_reward} XP
                    </span>
                  </div>
                  
                  {!compact && challenge.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {challenge.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Progress 
                      value={challenge.percentComplete} 
                      className="h-1.5 flex-1" 
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {challenge.progress?.current_value || 0}/{challenge.target_value}
                    </span>
                  </div>

                  {canClaim && (
                    <Button
                      size="sm"
                      onClick={() => handleClaimReward(challenge.id, challenge.xp_reward)}
                      disabled={claimReward.isPending}
                      className="mt-2 h-7 text-xs gap-1"
                    >
                      <Gift className="h-3 w-3" />
                      Resgatar
                    </Button>
                  )}

                  {isClaimed && (
                    <span className="text-xs text-green-600 dark:text-green-400 mt-2 inline-block">
                      ✓ Completado
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
