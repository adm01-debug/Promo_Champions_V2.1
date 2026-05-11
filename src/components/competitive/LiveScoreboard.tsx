import React, { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, TrendingUp, Flame, Monitor, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCompetitiveRanking } from '@/hooks/useCompetitiveRanking';

const RANK_COLORS = [
  'from-rank-gold to-coins',
  'from-rank-silver to-rank-silver/70',
  'from-rank-bronze to-streak',
];

interface LiveScoreboardProps {
  className?: string;
}

const LiveScoreboardComponent: FC<LiveScoreboardProps> = ({ className }) => {
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [lastDeal, setLastDeal] = useState<{ name: string; value: number } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (ranking?.length && ranking[0].totalSales > 0) {
      setLastDeal({ name: ranking[0].name, value: ranking[0].totalSales });
    }
  }, [ranking]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const topFive = ranking?.slice(0, 5) || [];
  const totalTeamRevenue = ranking?.reduce((s, p) => s + p.totalSales, 0) || 0;
  const totalDeals = ranking?.reduce((s, p) => s + p.dealsCount, 0) || 0;

  if (isLoading) {
    return <div className="h-96 rounded-xl bg-muted/30 animate-pulse" />;
  }

  return (
    <div className={cn(
      'space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700',
      isFullscreen && 'fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl p-8 overflow-auto',
      className
    )}>
      <Card className="glass border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
        <div className="bg-white/5 backdrop-blur-xl relative z-10">
          {/* Header */}
          <CardHeader className="pb-6 border-b border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <CardTitle className="text-3xl flex items-center gap-4 italic uppercase font-black tracking-tighter">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                  <Monitor className="h-7 w-7 text-primary-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                </div>
                <div>
                  <span className="block gradient-text">Placar ao Vivo</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                      {clock.toLocaleTimeString('pt-BR')} • Real-time Sync
                    </span>
                  </div>
                </div>
              </CardTitle>
              <div className="flex gap-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 h-10 flex items-center">
                  Update: 60s
                </Badge>
                <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-2 h-10 px-4 border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest">
                  <Maximize2 className="h-4 w-4" />
                  {isFullscreen ? 'Sair' : 'TV Mode'}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Team KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Receita do Time', value: `R$ ${(totalTeamRevenue / 1000).toFixed(0)}k`, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: TrendingUp },
                { label: 'Deals Fechados', value: totalDeals, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Flame },
                { label: 'Competidores', value: ranking?.length || 0, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Monitor }
              ].map((kpi, idx) => (
                <div key={idx} className={cn("rounded-3xl p-6 text-center border relative overflow-hidden group/kpi", kpi.bg, kpi.border)}>
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/kpi:scale-110 transition-transform">
                    <kpi.icon className="size-12" />
                  </div>
                  <p className={cn("text-4xl font-black italic tracking-tighter mb-1", kpi.color)}>
                    {kpi.value}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Last deal ticker */}
            {lastDeal && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden group/ticker"
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.05),transparent)] animate-shimmer" />
                <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 animate-pulse relative z-10">
                  <Flame className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-foreground relative z-10">
                  <span className="font-black italic uppercase tracking-tighter text-emerald-400 mr-2">Top Performance:</span>
                  <strong>{lastDeal.name}</strong> lidera a arena com{' '}
                  <strong className="text-emerald-400 font-black">
                    R$ {lastDeal.value.toLocaleString('pt-BR')}
                  </strong>
                </span>
              </motion.div>
            )}

            {/* Scoreboard */}
            <div className="space-y-2">
              <AnimatePresence>
                {topFive.map((person, i) => {
                  const maxSales = topFive[0]?.totalSales || 1;
                  const barWidth = (person.totalSales / maxSales) * 100;

                  return (
                    <motion.div
                      key={person.id}
                      layout
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                      className={cn(
                        'relative flex items-center gap-4 p-4 rounded-xl border overflow-hidden',
                        i === 0 && 'bg-gradient-to-r from-rank-gold/10 to-transparent border-rank-gold/30',
                        i > 0 && 'bg-muted/20 border-border/30',
                      )}
                    >
                      {/* Animated bar background */}
                      <motion.div
                        className={cn(
                          'absolute inset-y-0 left-0 opacity-10',
                          i < 3 ? `bg-gradient-to-r ${RANK_COLORS[i]}` : 'bg-primary'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                      />

                      <div className={cn(
                        'relative z-10 h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg',
                        i < 3 ? `bg-gradient-to-br ${RANK_COLORS[i]} text-primary-foreground shadow-lg` : 'bg-muted text-muted-foreground'
                      )}>
                        {i < 3 ? (
                          <Crown className={cn('h-6 w-6', i === 0 && 'animate-bounce')} />
                        ) : (
                          <span>#{person.rank}</span>
                        )}
                      </div>

                      <Avatar className="relative z-10 h-11 w-11 border-2 border-background shadow-md">
                        <AvatarImage src={person.avatar_url || undefined} />
                        <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                          {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="relative z-10 flex-1 min-w-0">
                        <p className={cn(
                          'font-bold truncate',
                          i === 0 ? 'text-lg text-foreground' : 'text-sm text-foreground'
                        )}>
                          {person.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{person.dealsCount} deals</Badge>
                          {person.dealsCount >= 5 && (
                            <span className="text-[10px] text-coins font-medium flex items-center gap-0.5">
                              <Flame className="h-3 w-3" /> On Fire
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10 text-right">
                        <p className={cn(
                          'font-bold',
                          i === 0 ? 'text-2xl text-rank-gold' : 'text-lg text-foreground'
                        )}>
                          R$ {(person.totalSales / 1000).toFixed(0)}k
                        </p>
                        {i > 0 && (
                          <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5">
                            <TrendingUp className="h-2.5 w-2.5" />
                            -R$ {((topFive[0].totalSales - person.totalSales) / 1000).toFixed(0)}k
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};


export const LiveScoreboard = React.memo(LiveScoreboardComponent);
