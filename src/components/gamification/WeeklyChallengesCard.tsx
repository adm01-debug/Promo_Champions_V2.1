import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
} from "@/hooks/gamification/useWeeklyChallenges";

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
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br transition-all duration-500 shadow-xl group/challenge",
        gradientClass,
        "text-primary-foreground border border-white/10"
      )}
    >
      {/* Dynamic Background Polish */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 blur-2xl rounded-full -ml-12 -mb-12 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg border border-white/10 group-hover:rotate-6 transition-transform duration-500">
              {icon}
            </div>
            <div className="min-w-0">
              <h4 className="font-display font-black text-lg tracking-tight uppercase italic drop-shadow-sm truncate pr-2">{challenge.title}</h4>
              <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest line-clamp-1">{challenge.description}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-none shadow-md backdrop-blur-md font-black text-[10px] uppercase tracking-widest px-2.5 py-1">
            <Zap className="h-3 w-3 mr-1.5 text-yellow-300 animate-pulse" />
            +{challenge.xp_reward} XP
          </Badge>
        </div>

        {/* Progress System */}
        <div className="space-y-3">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest px-1">
            <span className="text-white/80">Status da Missão</span>
            <span className="text-lg font-display font-black tracking-tighter italic">
              {challenge.progress?.current_value || 0} <span className="text-xs text-white/50">/ {challenge.target_value}</span>
            </span>
          </div>
          <div className="relative h-3.5 bg-black/20 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${challenge.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)] flex items-center justify-end px-1"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-shimmer" />
            </motion.div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/10 border border-white/5 backdrop-blur-sm">
            <Clock className="h-3 w-3 text-white/80" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/90">
              {challenge.daysRemaining === 0
                ? "Fim do Prazo!"
                : challenge.daysRemaining === 1
                ? "1 dia p/ encerramento"
                : `${challenge.daysRemaining} dias restantes`}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {canClaim && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.1 }}
              >
                <Button
                  size="sm"
                  onClick={handleClaim}
                  disabled={claimReward.isPending}
                  className="bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-9 px-5 rounded-xl shadow-xl shadow-black/20 italic transition-all"
                >
                  <Gift className="h-3.5 w-3.5 mr-2 animate-bounce" />
                  Resgatar Recompensa
                </Button>
              </motion.div>
            )}
            {alreadyClaimed && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md font-black uppercase tracking-widest text-[10px] shadow-sm border border-white/10"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                Sincronizado
              </motion.div>
            )}
            {!canClaim && !alreadyClaimed && (
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 italic">
                {Math.round(challenge.percentage)}% Concluído
              </div>
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
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Desafios da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary/40" />
              </div>
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm font-medium text-foreground/70">Nenhum desafio ativo no momento</p>
            <p className="text-xs text-muted-foreground mt-1">Novos desafios em breve!</p>
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
