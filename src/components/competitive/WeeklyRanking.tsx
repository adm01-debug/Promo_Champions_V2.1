import React, { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Medal, Trophy, TrendingUp, Sparkles, Flame, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useWeeklyRanking } from '@/hooks/useWeeklyRanking';


const PODIUM_CONFIG: Record<number, { icon: typeof Crown; gradient: string; label: string }> = {
  1: { icon: Crown, gradient: 'from-rank-gold to-coins', label: '🥇 Campeão da Semana' },
  2: { icon: Medal, gradient: 'from-rank-silver to-rank-silver/70', label: '🥈 Vice' },
  3: { icon: Trophy, gradient: 'from-rank-bronze to-streak', label: '🥉 Bronze' },
};

interface WeeklyRankingProps {
  className?: string;
}

const WeeklyRankingComponent: FC<WeeklyRankingProps> = ({ className }) => {
  const { data: ranking, isLoading } = useWeeklyRanking();
  const [celebrated, setCelebrated] = useState(false);

  // Confetti for top 3 on first load
  useEffect(() => {
    if (ranking?.length && ranking[0].weeklySales > 0 && !celebrated) {
      setCelebrated(true);
      setTimeout(() => {
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.3 },
            colors: ['#FFD700', '#FFA500', '#FF6347'],
          });
        });
      }, 500);
    }
  }, [ranking, celebrated]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  const topThree = ranking?.slice(0, 3) || [];
  const rest = ranking?.slice(3) || [];
  const maxSales = topThree[0]?.weeklySales || 1;

  return (
    <div className={cn('space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700', className)}>
      <Card className="glass border-white/5 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rank-gold/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-rank-gold/20 transition-colors" />
        <div className="bg-white/5 backdrop-blur-xl relative z-10">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-2xl flex items-center gap-4 italic uppercase font-black tracking-tighter">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rank-gold to-coins flex items-center justify-center shadow-xl shadow-rank-gold/20 group-hover:rotate-6 transition-transform">
                <Crown className="h-6 w-6 text-primary-foreground drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]" />
              </div>
              <div>
                <span className="block gradient-text">Ranking Semanal</span>
                <div className="flex items-center gap-2 mt-1">
                   <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 px-3 py-0.5">
                    <Sparkles className="h-3 w-3 mr-1.5 text-rank-gold" />
                    Reseta toda segunda
                  </Badge>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {topThree.map((person, i) => {
                const config = PODIUM_CONFIG[person.rank];
                const Icon = config?.icon || TrendingUp;
                return (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      'relative flex items-center gap-6 p-5 rounded-2xl border transition-all duration-500 group/row overflow-hidden',
                      i === 0 ? 'bg-rank-gold/10 border-rank-gold/30 shadow-2xl shadow-rank-gold/10' : 
                      i === 1 ? 'bg-white/5 border-white/5 hover:bg-white/10' :
                      'bg-white/5 border-white/5 hover:bg-white/10'
                    )}
                  >
                    <div className={cn(
                      'relative z-10 h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br text-primary-foreground shadow-2xl group-hover/row:scale-110 transition-transform duration-500',
                      config?.gradient || 'from-muted to-muted'
                    )}>
                      <Icon className={cn('h-7 w-7', i === 0 && 'animate-bounce')} />
                    </div>

                    <div className="relative z-10">
                      <Avatar className="h-14 w-14 border-2 border-background shadow-2xl">
                        <AvatarImage src={person.avatar_url || undefined} />
                        <AvatarFallback className="text-sm font-black bg-primary/20 text-primary">
                          {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {i === 0 && (
                        <div className="absolute -top-2 -right-2 size-6 rounded-full bg-rank-gold flex items-center justify-center border-2 border-background animate-bounce shadow-lg">
                          <Sparkles className="size-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <span className="font-black italic uppercase tracking-tighter text-lg text-foreground truncate">{person.name}</span>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-black/40 border-white/10 w-fit">
                          {config?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(person.weeklySales / maxSales) * 100}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className={cn('h-full relative', i === 0 ? 'bg-rank-gold' : 'bg-primary')}
                          >
                             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
                          </motion.div>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">{person.dealsCount} deals</span>
                      </div>
                    </div>

                    <div className="relative z-10 text-right">
                      <p className={cn('font-black italic tracking-tighter leading-none', i === 0 ? 'text-3xl text-rank-gold' : 'text-xl text-foreground')}>
                        R$ {(person.weeklySales / 1000).toFixed(0)}k
                      </p>
                      {i === 0 && (
                         <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1 flex items-center justify-end gap-1">
                           <Flame className="size-2.5 animate-pulse" /> MVP Leader
                         </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Rest of the ranking */}
            {rest.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 italic flex items-center gap-2">
                  <Target className="size-3" /> Challengers
                </h4>
                {rest.map((person, idx) => (
                  <motion.div 
                    key={person.id} 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group/rest border border-transparent hover:border-white/5"
                  >
                    <span className="text-xs font-black italic text-muted-foreground w-6 text-center group-hover/rest:text-primary transition-colors">#{person.rank}</span>
                    <Avatar className="h-10 w-10 border border-white/5">
                      <AvatarImage src={person.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] font-black bg-white/5">{person.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold uppercase tracking-tight text-foreground flex-1 truncate">{person.name}</span>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{person.dealsCount} deals</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black italic tracking-tighter text-foreground">
                        R$ {(person.weeklySales / 1000).toFixed(0)}k
                      </span>
                      <div className="flex items-center gap-1 justify-end">
                        <Zap className="size-2.5 text-primary" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">Contender</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {(!ranking?.length || ranking[0].weeklySales === 0) && (
              <div className="text-center py-12 relative overflow-hidden rounded-3xl bg-white/5 border border-dashed border-white/10">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4 animate-pulse" />
                <p className="text-lg font-black italic uppercase tracking-tighter gradient-text">A Arena está Aberta</p>
                <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest px-8">Nenhuma venda registrada esta semana. Quem conquistará o trono primeiro? 🚀</p>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};


export const WeeklyRanking = React.memo(WeeklyRankingComponent);
