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
    <div className={cn('space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700', className)}>
      {/* Progress header */}
      <Card className="glass border-white/5 shadow-2xl overflow-hidden relative group">
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r transition-colors duration-1000',
          allCompleted ? 'from-emerald-500/10 via-emerald-500/5 to-transparent' : 'from-primary/10 via-primary/5 to-transparent'
        )} />
        <div className="bg-white/5 backdrop-blur-xl relative z-10">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <CardTitle className="text-2xl flex items-center gap-4 italic uppercase font-black tracking-tighter">
                <div className={cn(
                  'h-12 w-12 rounded-xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:rotate-6',
                  allCompleted ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/20'
                )}>
                  {allCompleted ? <Check className="h-6 w-6" /> : <Target className="h-6 w-6" />}
                </div>
                <div>
                  <span className="block gradient-text">Missões Diárias</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="size-3 text-muted-foreground/60" />
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Reseta em 14h 22m</span>
                  </div>
                </div>
              </CardTitle>
              <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status Global</p>
                  <p className={cn("text-xs font-black uppercase italic tracking-tighter", allCompleted ? "text-emerald-400" : "text-primary")}>
                    {allCompleted ? "Legacy Achieved" : "Em Execução"}
                  </p>
                </div>
                <Badge variant="outline" className={cn(
                  'text-[10px] font-black uppercase tracking-widest px-4 py-1.5 h-10 flex items-center',
                  allCompleted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-primary/10 text-primary border-primary/20'
                )}>
                  {allCompleted ? '✅ 100% COMPLETE' : `${completedCount}/${totalCount} MISSIONS`}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden shadow-inner border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / Math.max(totalCount, 1)) * 100}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className={cn(
                    'h-full relative',
                    allCompleted ? 'bg-emerald-500' : 'bg-primary'
                  )}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
                </motion.div>
              </div>
              {allCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                >
                  <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase italic tracking-tighter">Parabéns, Gladiador!</p>
                    <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Você dominou todas as frentes de hoje. Retorne amanhã para novos desafios.</p>
                  </div>
                  <Sparkles className="size-5 ml-auto text-emerald-400/50 animate-bounce" />
                </motion.div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Mission cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missions.map((mission, i) => {
          const Icon = missionIcons[mission.challenge_type] || missionIcons.default;
          const gradient = missionGradients[mission.challenge_type] || missionGradients.default;
          const progressPercent = Math.min((mission.currentValue / mission.target_value) * 100, 100);

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={cn(
                'group relative flex flex-col p-6 rounded-3xl border glass transition-all duration-500 hover:border-primary/40 overflow-hidden',
                mission.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5',
                mission.completed ? '' : 'hover:bg-white/10'
              )}>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110',
                    mission.completed ? 'bg-emerald-500 text-white' : 'bg-white/5 text-primary border border-white/5'
                  )}>
                    {mission.completed ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
                      mission.completed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      <Zap className="h-2.5 w-2.5 mr-1.5" />
                      {mission.xp_reward} XP REWARD
                    </Badge>
                    {mission.completed && (
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">OBJETIVO ALCANÇADO</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <h4 className={cn(
                      'text-lg font-black italic uppercase tracking-tighter leading-none mb-1 group-hover:text-primary transition-colors',
                      mission.completed && 'text-emerald-400'
                    )}>
                      {mission.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em] line-clamp-1">{mission.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black italic tracking-tighter">{mission.currentValue}</span>
                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase">/ {mission.target_value}</span>
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className={cn('h-full', mission.completed ? 'bg-emerald-500' : 'bg-primary')}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    {mission.completed && !mission.xp_claimed && (
                      <Button
                        size="sm"
                        className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-emerald-500/20 group/btn"
                        onClick={() => handleClaim(mission.id, mission.xp_reward)}
                        disabled={claimXP.isPending}
                      >
                        <Rocket className="h-4 w-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Coletar Recompensa
                      </Button>
                    )}
                    {mission.xp_claimed && (
                      <div className="flex items-center justify-center gap-2 h-10 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <Check className="h-3 w-3" /> Recompensa Coletada
                      </div>
                    )}
                  </div>
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
