import { motion } from "framer-motion";
import { useDailyMissions } from "@/hooks/gamification/useDailyMissions";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Zap, CheckCircle2, Star, Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { itemVariants } from "@/components/transitions/PageTransition";

export function DailyMissionsPanel() {
  const { user } = useAuth();
  const { missions, isLoading, claimXP, completedCount, totalCount } = useDailyMissions(user?.id);

  if (isLoading) {
    return (
      <Card className="glass border-border/40 animate-pulse">
        <CardHeader className="pb-2"><div className="h-5 w-40 bg-muted rounded" /></CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  if (!missions || missions.length === 0) return null;

  const handleClaim = (missionId: string, xp: number) => {
    claimXP.mutate(missionId, {
      onSuccess: () => {
        toast.success(`Parabéns! Você resgatou ${xp} XP`);
      }
    });
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass dark:border-glow card-elevated overflow-hidden group">
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-b border-border/30">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/20 text-primary shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform">
                  <Target className="h-3.5 w-3.5" />
                </div>
                Missões do Dia
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-muted/50 text-muted-foreground font-bold">
                  {completedCount}/{totalCount}
                </Badge>
                {completedCount === totalCount && (
                  <Badge className="bg-success/20 text-success border-success/30 animate-bounce">
                    100%
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((mission, index) => {
              const progress = Math.min(100, (mission.currentValue / mission.target_value) * 100);
              const isClaimable = mission.completed && !mission.xp_claimed;

              return (
                <div 
                  key={mission.id} 
                  className={cn(
                    "relative overflow-hidden rounded-xl border p-3 transition-all duration-300",
                    mission.completed 
                      ? "bg-success/5 border-success/30" 
                      : "bg-card/50 border-border/40 hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-2 relative z-10">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold font-display group-hover:text-primary transition-colors line-clamp-1">
                        {mission.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {mission.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-bold shrink-0">
                      +{mission.xp_reward} XP
                    </Badge>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider">
                      <span className={mission.completed ? "text-success" : "text-muted-foreground"}>
                        {mission.completed ? "Missão Cumprida!" : `${Math.round(progress)}% Concluído`}
                      </span>
                      <span className="text-foreground">
                        {mission.currentValue} / {mission.target_value}
                      </span>
                    </div>
                    <Progress value={progress} className={cn("h-1.5", mission.completed ? "bg-success/20" : "bg-primary/10")} />
                  </div>

                  {isClaimable && (
                    <Button 
                      size="sm" 
                      variant="glow" 
                      className="w-full mt-2 h-7 text-[10px] font-bold uppercase tracking-widest gap-2 bg-success/20 hover:bg-success/30 text-success border-success/30"
                      onClick={() => handleClaim(mission.id, mission.xp_reward)}
                      disabled={claimXP.isPending}
                    >
                      <Star className="h-3 w-3 fill-current" />
                      Resgatar XP
                    </Button>
                  )}

                  {mission.xp_claimed && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-bold text-success uppercase">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      XP Resgatado
                    </div>
                  )}

                  {/* Decorative background icon */}
                  <div className="absolute -bottom-2 -right-2 opacity-5 pointer-events-none">
                    <Zap className={cn("h-16 w-16 rotate-12", mission.completed ? "text-success" : "text-primary")} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
