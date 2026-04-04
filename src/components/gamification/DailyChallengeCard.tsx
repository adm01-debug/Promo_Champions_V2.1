import React from "react";
import { CheckCircle, XCircle, Target } from "lucide-react";
import { getDailyChallengeIcon, getDailyChallengeColor } from "@/hooks/useDailyChallenges";

interface DailyChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string | null;
    challenge_type: string;
    target_value: number;
    xp_reward: number;
    progress: {
      current_value: number;
      completed_at: string | null;
      xp_claimed: boolean;
    } | null;
  };
}

export const DailyChallengeCard = React.memo(function DailyChallengeCard({ challenge }: DailyChallengeCardProps) {
  const isCompleted = !!challenge.progress?.completed_at;
  const isClaimed = challenge.progress?.xp_claimed;
  const percentComplete = challenge.progress
    ? Math.min((challenge.progress.current_value / challenge.target_value) * 100, 100)
    : 0;

  return (
    <div className={`rounded-lg border p-4 transition-colors ${
      isClaimed ? 'bg-green-500/5 border-green-500/20'
        : isCompleted ? 'bg-amber-500/5 border-amber-500/20'
        : 'bg-muted/30'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${getDailyChallengeColor(challenge.challenge_type)} text-white text-lg shrink-0`}>
          {getDailyChallengeIcon(challenge.challenge_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`font-medium text-sm ${isClaimed ? 'line-through text-muted-foreground' : ''}`}>{challenge.title}</h4>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">+{challenge.xp_reward} XP</span>
          </div>
          {challenge.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{challenge.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isClaimed ? 'bg-green-500' : isCompleted ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${percentComplete}%` }} />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{challenge.progress?.current_value || 0}/{challenge.target_value}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {isClaimed ? (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" />XP Resgatado</span>
            ) : isCompleted ? (
              <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"><Target className="h-3 w-3" />Completado</span>
            ) : challenge.progress ? (
              <span className="text-xs text-muted-foreground">Em progresso</span>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3" />Não iniciado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
