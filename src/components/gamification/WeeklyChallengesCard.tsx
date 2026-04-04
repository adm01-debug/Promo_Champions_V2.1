import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Clock, Zap, Gift, CheckCircle2 } from "lucide-react";
import {
  useChallengesWithProgress,
  useClaimChallengeReward,
  CHALLENGE_ICONS,
  CHALLENGE_COLORS,
  type ChallengeWithProgress,
} from "@/hooks/useWeeklyChallenges";

interface WeeklyChallengesCardProps {
  salespersonId?: string;
  compact?: boolean;
}

function ChallengeItem({
  challenge,
  salespersonId,
  compact,
}: {
  challenge: ChallengeWithProgress;
  salespersonId: string;
  compact?: boolean;
}) {
  const claimReward = useClaimChallengeReward();
  const canClaim = challenge.isCompleted && !challenge.progress?.xp_claimed;
  const alreadyClaimed = challenge.progress?.xp_claimed;

  const handleClaim = () => {
    claimReward.mutate({
      challengeId: challenge.id,
      salespersonId,
      xpReward: challenge.xp_reward,
      challengeTitle: challenge.title,
    });
  };

  const icon = CHALLENGE_ICONS[challenge.challenge_type] || "⚡";
  const gradientClass = CHALLENGE_COLORS[challenge.challenge_type] || "from-primary to-primary/80";

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
      >
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{challenge.title}</p>
          <div className="flex items-center gap-2">
            <Progress value={challenge.percentage} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground">
              {challenge.progress?.current_value || 0}/{challenge.target_value}
            </span>
          </div>
        </div>
        {canClaim && (
          <Button size="sm" variant="secondary" onClick={handleClaim} disabled={claimReward.isPending}>
            <Gift className="h-3 w-3" />
          </Button>
        )}
        {alreadyClaimed && <CheckCircle2 className="h-4 w-4 text-success" />}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${gradientClass} text-primary-foreground shadow-lg`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{icon}</span>
            <div>
              <h4 className="font-bold">{challenge.title}</h4>
              <p className="text-xs text-primary-foreground/80">{challenge.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0">
            <Zap className="h-3 w-3 mr-1" />
            +{challenge.xp_reward} XP
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span className="font-bold">
              {challenge.progress?.current_value || 0} / {challenge.target_value}
            </span>
          </div>
          <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${challenge.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-white rounded-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-xs text-primary-foreground/80">
            <Clock className="h-3 w-3" />
            <span>
              {challenge.daysRemaining === 0
                ? "Último dia!"
                : challenge.daysRemaining === 1
                ? "1 dia restante"
                : `${challenge.daysRemaining} dias restantes`}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {canClaim && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleClaim}
                  disabled={claimReward.isPending}
                  className="bg-white text-primary hover:bg-white/90 font-bold"
                >
                  <Gift className="h-4 w-4 mr-1" />
                  Resgatar
                </Button>
              </motion.div>
            )}
            {alreadyClaimed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-primary-foreground font-medium"
              >
                <CheckCircle2 className="h-4 w-4" />
                Resgatado
              </motion.div>
            )}
            {!canClaim && !alreadyClaimed && (
              <span className="text-sm font-medium">{Math.round(challenge.percentage)}%</span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function WeeklyChallengesCard({ salespersonId, compact = false }: WeeklyChallengesCardProps) {
  const { challenges, isLoading } = useChallengesWithProgress(salespersonId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Desafios da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!challenges.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Desafios da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum desafio ativo no momento</p>
            <p className="text-sm">Novos desafios em breve!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = challenges.filter((c) => c.isCompleted).length;
  const claimedCount = challenges.filter((c) => c.progress?.xp_claimed).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Desafios da Semana
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {completedCount}/{challenges.length} completos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={compact ? "space-y-2" : "grid gap-4 md:grid-cols-2"}>
          {challenges.map((challenge) => (
            <ChallengeItem
              key={challenge.id}
              challenge={challenge}
              salespersonId={salespersonId || ""}
              compact={compact}
            />
          ))}
        </div>

        {claimedCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-primary/10 rounded-lg text-center"
          >
            <p className="text-sm text-primary font-medium">
              🎉 Você já resgatou {claimedCount} recompensa{claimedCount > 1 ? "s" : ""} esta semana!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
