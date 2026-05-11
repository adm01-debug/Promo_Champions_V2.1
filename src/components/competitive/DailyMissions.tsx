import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Check, Gift, Flame, Phone, Mail, MessageSquare, Sparkles, Clock, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { toast } from 'sonner';

const missionIcons: Record<string, typeof Target> = {
  calls: Phone,
  emails: Mail,
  meetings: MessageSquare,
  sales: Zap,
  default: Target,
};

const missionGradients: Record<string, string> = {
  calls: 'from-info/15 to-info/5 border-info/20',
  emails: 'from-primary/15 to-primary/5 border-primary/20',
  meetings: 'from-success/15 to-success/5 border-success/20',
  sales: 'from-coins/15 to-coins/5 border-coins/20',
  default: 'from-primary/15 to-primary/5 border-primary/20',
};

interface DailyMissionsProps {
  salespersonId?: string;
  className?: string;
}

const DailyMissionsComponent: FC<DailyMissionsProps> = ({ salespersonId, className }) => {
  const { missions, isLoading, claimXP, completedCount, totalCount } = useDailyMissions(salespersonId);

  const handleClaim = (missionId: string, xp: number) => {
    claimXP.mutate(missionId, {
      onSuccess: () => toast.success(`+${xp} XP coletado! 🎉`),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  if (!missions?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Target className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">Sem missões hoje</p>
          <p className="text-xs text-muted-foreground mt-1">Missões são geradas automaticamente todos os dias às 6h</p>
        </CardContent>
      </Card>
    );
  }

  const allCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress header */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className={cn(
          'bg-gradient-to-r',
          allCompleted ? 'from-success/15 to-success/5' : 'from-primary/15 to-accent/5'
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center',
                  allCompleted ? 'bg-success' : 'bg-gradient-to-br from-primary to-accent'
                )}>
                  {allCompleted ? <Check className="h-4 w-4 text-success-foreground" /> : <Target className="h-4 w-4 text-primary-foreground" />}
                </div>
                Missões do Dia
              </CardTitle>
              <Badge variant="outline" className={cn(
                'text-xs',
                allCompleted && 'bg-success/20 text-success border-success/30'
              )}>
                {allCompleted ? '✅ Tudo completo!' : `${completedCount}/${totalCount}`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <Progress value={(completedCount / Math.max(totalCount, 1)) * 100} className="h-2" />
            {allCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-xs text-success font-medium"
              >
                <Flame className="h-3 w-3" />
                Parabéns! Todas as missões completas hoje!
              </motion.div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Mission cards */}
      <div className="space-y-2">
        {missions.map((mission, i) => {
          const Icon = missionIcons[mission.challenge_type] || missionIcons.default;
          const gradient = missionGradients[mission.challenge_type] || missionGradients.default;
          const progressPercent = Math.min((mission.currentValue / mission.target_value) * 100, 100);

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-r transition-all',
                mission.completed ? 'opacity-80' : '',
                gradient
              )}>
                <div className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                  mission.completed ? 'bg-success/20' : 'bg-background/60'
                )}>
                  {mission.completed ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <Icon className="h-5 w-5 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-semibold',
                    mission.completed && 'line-through text-muted-foreground'
                  )}>
                    {mission.title}
                  </p>
                  {mission.description && (
                    <p className="text-xs text-muted-foreground truncate">{mission.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={progressPercent} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {mission.currentValue}/{mission.target_value}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    <Zap className="h-2.5 w-2.5 mr-0.5" />
                    {mission.xp_reward} XP
                  </Badge>
                  {mission.completed && !mission.xp_claimed && (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-6 text-[10px] px-2"
                      onClick={() => handleClaim(mission.id, mission.xp_reward)}
                      disabled={claimXP.isPending}
                    >
                      <Gift className="h-3 w-3 mr-1" />
                      Coletar
                    </Button>
                  )}
                  {mission.xp_claimed && (
                    <span className="text-[10px] text-success font-medium">✓ Coletado</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};


export const DailyMissions = React.memo(DailyMissionsComponent);
