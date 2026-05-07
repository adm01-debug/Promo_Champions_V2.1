import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Zap, Clock, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";
import {
  useDailyChallengesWithProgress,
  useClaimDailyChallengeReward,
  getDailyChallengeIcon,
  getDailyChallengeColor,
} from "@/hooks/useDailyChallenges";

interface DailyChallengesCardProps {
  salespersonId?: string;
  compact?: boolean;
  showTestButton?: boolean;
}

export function DailyChallengesCard({ salespersonId, compact = false, showTestButton = false }: DailyChallengesCardProps) {
  const { data: rawChallenges, isLoading } = useDailyChallengesWithProgress(salespersonId);
  const claimReward = useClaimDailyChallengeReward();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Enrich challenges with computed properties
  const challenges = (rawChallenges || []).map(challenge => ({
    ...challenge,
    isCompleted: (challenge.progress?.current_value || 0) >= challenge.target_value,
    percentComplete: challenge.target_value > 0
      ? Math.min(((challenge.progress?.current_value || 0) / challenge.target_value) * 100, 100)
      : 0,
  }));

  const handleClaimReward = (challengeId: string, xpReward: number) => {
    if (!salespersonId) return;
    triggerHaptic('success');
    claimReward.mutate({ challengeId, salespersonId, xpReward });
  };

  const handleGenerateDailyChallenges = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('rotate-daily-challenges');
      
      if (error) throw error;
      
      toast.success('Desafios diários gerados!', {
        description: data?.message || 'Novos desafios disponíveis'
      });
      
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-progress'] });
    } catch (error) {
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) console.error('Error generating daily challenges:', error);
      }
      toast.error('Erro ao gerar desafios', {
        description: 'Tente novamente mais tarde'
      });
    } finally {
      setIsGenerating(false);
    }
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
            <Zap className="h-5 w-5 text-rank-gold" />
            Desafios do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Novos desafios serão gerados em breve!
            </p>
            {showTestButton && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateDailyChallenges}
                disabled={isGenerating}
                className="mt-3 gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Gerar Agora (Teste)
              </Button>
            )}
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
            <Zap className="h-5 w-5 text-rank-gold" />
            Desafios do Dia
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {completedCount}/{challenges.length} • {totalXP} XP
            </span>
            {showTestButton && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleGenerateDailyChallenges}
                disabled={isGenerating}
                className="h-7 w-7 p-0"
                title="Gerar novos desafios (teste)"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge, index) => {
          const canClaim = challenge.isCompleted && !challenge.progress?.xp_claimed;
          const isClaimed = challenge.progress?.xp_claimed;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className={cn(
                "group/item rounded-2xl border transition-all duration-500 overflow-hidden relative",
                isClaimed 
                  ? 'bg-muted/30 border-muted opacity-60' 
                  : challenge.isCompleted 
                    ? 'bg-success/5 border-success/30 shadow-lg shadow-success/5 ring-1 ring-success/20' 
                    : 'bg-background/40 backdrop-blur-sm border-border/10 hover:border-primary/40 hover:bg-background/60 shadow-xl'
              )}
            >
              <div className="p-4 flex items-start gap-4 relative z-10">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shrink-0 transition-transform duration-500 group-hover/item:scale-110 group-hover/item:rotate-6",
                  getDailyChallengeColor(challenge.challenge_type),
                  "text-white"
                )}>
                  {getDailyChallengeIcon(challenge.challenge_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={cn(
                      "font-display font-black text-sm uppercase tracking-tight italic truncate",
                      isClaimed && 'line-through text-muted-foreground'
                    )}>
                      {challenge.title}
                    </h4>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rank-gold/10 border border-rank-gold/20 shrink-0">
                      <Zap className="h-2.5 w-2.5 text-rank-gold animate-pulse" />
                      <span className="text-[10px] font-black text-rank-gold uppercase tracking-widest">
                        +{challenge.xp_reward} XP
                      </span>
                    </div>
                  </div>
                  
                  {!compact && challenge.description && (
                    <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 mb-3 opacity-70">
                      {challenge.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest px-0.5">
                      <span className="text-muted-foreground/60 italic">Progress</span>
                      <span className="text-primary italic">{challenge.progress?.current_value || 0} / {challenge.target_value}</span>
                    </div>
                    <div className="relative h-2.5 bg-muted/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div 
                        className={cn(
                          "absolute h-full transition-all duration-1000 ease-out",
                          challenge.isCompleted ? "bg-status-success shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-primary"
                        )}
                        style={{ width: `${challenge.percentComplete}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {canClaim && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-4"
                      >
                        <Button
                          size="sm"
                          onClick={() => handleClaimReward(challenge.id, challenge.xp_reward)}
                          disabled={claimReward.isPending}
                          className="w-full bg-status-success hover:bg-status-success/90 text-white font-black uppercase tracking-widest text-[10px] h-9 rounded-xl shadow-lg shadow-status-success/20 italic"
                        >
                          <Gift className="h-4 w-4 mr-2 animate-bounce" />
                          Coletar Recompensa
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isClaimed && (
                    <div className="mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-status-success/60 italic">
                      <CheckCircle2 className="h-3 w-3" />
                      Objetivo Concluído
                    </div>
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
