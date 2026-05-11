import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Star, Flame, Calendar, Sparkles, TrendingUp, Trophy, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCompetitiveSeasons } from '@/hooks/useCompetitiveSeasons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const powerUpIcons: Record<string, typeof Zap> = {
  xp_boost: Zap,
  streak_shield: Shield,
  double_points: Star,
};

const powerUpLabels: Record<string, string> = {
  xp_boost: 'XP Boost',
  streak_shield: 'Streak Shield',
  double_points: 'Pontos Duplos',
};

const powerUpColors: Record<string, string> = {
  xp_boost: 'from-primary/20 to-accent/10 border-primary/30',
  streak_shield: 'from-success/20 to-success/5 border-success/30',
  double_points: 'from-rank-gold/20 to-rank-gold/5 border-rank-gold/30',
};

const SeasonAndPowerUpsComponent: FC = () => {
  const { currentSeason, powerUps, isLoading } = useCompetitiveSeasons();

  if (isLoading) {
    return <div className="h-48 rounded-xl bg-muted/30 animate-pulse" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Current Season */}
      {currentSeason ? (
        <Card className="glass border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-primary/20 transition-colors duration-700" />
          <div className="bg-white/5 backdrop-blur-xl relative z-10">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Flame className="h-8 w-8 text-primary-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-primary/20 text-primary border-primary/30 px-2 py-0 text-[10px] font-black uppercase tracking-widest">
                        Temporada Ativa
                      </Badge>
                      <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <CardTitle className="text-3xl font-black italic uppercase tracking-tighter gradient-text leading-none">{currentSeason.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">
                      Season #{currentSeason.season_number} • Global Rankings
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">XP Multiplier</div>
                    <div className="flex items-center gap-2">
                       <Zap className="h-5 w-5 text-primary animate-pulse" />
                       <span className="text-4xl font-black italic tracking-tighter text-primary">{currentSeason.xp_multiplier}x</span>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-white/10 hidden md:block" />
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Time Remaining</div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                      <Calendar className="h-4 w-4 text-muted-foreground/60" />
                      <span className="text-xs font-black uppercase tracking-widest text-foreground">
                        {formatDistanceToNow(new Date(currentSeason.ends_at), { addSuffix: false, locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-primary to-accent relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
                </motion.div>
              </div>
            </CardContent>
          </div>
        </Card>
      ) : (
        <Card className="glass border-dashed border-white/10 bg-white/5">
          <CardContent className="p-12 text-center">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5 opacity-40">
              <Flame className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xl font-black italic uppercase tracking-tighter gradient-text">Interseason Period</p>
            <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">Next season starting soon...</p>
          </CardContent>
        </Card>
      )}

      {/* Active Power-Ups */}
      {powerUps && powerUps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 italic">
              <Sparkles className="h-4 w-4 text-primary" />
              Active Buffs & Power-ups
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {powerUps.map((pu, i: number) => {
              const Icon = powerUpIcons[pu.power_up_type] || Zap;
              const color = powerUpColors[pu.power_up_type] || powerUpColors.xp_boost;
              return (
                <motion.div
                  key={pu.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={cn(
                    'group relative flex items-center gap-5 p-5 rounded-3xl border glass overflow-hidden transition-all duration-500 hover:border-primary/40',
                    'bg-gradient-to-br',
                    color
                  )}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                      <Icon className="size-12" />
                    </div>
                    
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform relative z-10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-black italic uppercase tracking-tighter">
                          {powerUpLabels[pu.power_up_type] || pu.power_up_type}
                        </p>
                        <Badge variant="outline" className="text-[9px] font-black uppercase bg-black/40 border-white/10 text-foreground">
                          {pu.multiplier}x
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-3 truncate">
                        {(pu as Record<string, unknown> & { salespeople?: { name: string } }).salespeople?.name || 'Global Buff'}
                      </p>
                      
                      <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-lg w-fit border border-white/5">
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                          Expires {formatDistanceToNow(new Date(pu.expires_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


export const SeasonAndPowerUps = React.memo(SeasonAndPowerUpsComponent);
