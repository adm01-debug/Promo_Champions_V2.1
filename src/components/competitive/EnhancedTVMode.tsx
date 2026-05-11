import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Trophy, Flame, DollarSign, Target, Timer, Volume2, VolumeX, Sparkles, Zap, Rocket, Star, TrendingUp, Tv, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type TVScreen = 'leaderboard' | 'latest-sales' | 'goals' | 'streaks';

const ROTATION_INTERVAL = 15000; // 15 seconds

function EnhancedTVModeComponent() {
  const [currentScreen, setCurrentScreen] = useState<TVScreen>('leaderboard');
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const screens: TVScreen[] = ['leaderboard', 'latest-sales', 'goals', 'streaks'];

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setCurrentScreen(prev => {
        const idx = screens.indexOf(prev);
        return screens[(idx + 1) % screens.length];
      });
    }, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const { data: salespeople = [] } = useQuery({
    queryKey: ['tv-salespeople'],
    queryFn: async () => {
      const { data: sp } = await supabase.rpc('get_active_salespeople');
      const { data: xpData } = await supabase.from('salesperson_xp').select('salesperson_id, total_xp, current_level');
      const xpMap = new Map((xpData || []).map(x => [x.salesperson_id, x]));
      return (sp || []).map(s => ({
        ...s,
        xp: xpMap.get(s.id)?.total_xp || 0,
        level: xpMap.get(s.id)?.current_level || 1,
      })).sort((a, b) => b.xp - a.xp);
    },
    refetchInterval: 10000,
  });

  const { data: latestSales = [] } = useQuery({
    queryKey: ['tv-latest-sales'],
    queryFn: async () => {
      const { data } = await supabase
        .from('sales')
        .select('id, client_name, product_name, amount, status, created_at, salesperson_id')
        .eq('status', 'won')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['tv-goals'],
    queryFn: async () => {
      const { data } = await supabase.from('sales_goals').select('*, salespeople:salesperson_id(name)');
      return data || [];
    },
    refetchInterval: 30000,
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const spMap = new Map(salespeople.map(sp => [sp.id, sp.name]));

  const screenLabels: Record<TVScreen, { label: string; icon: typeof Trophy }> = {
    leaderboard: { label: 'RANKING AO VIVO', icon: Trophy },
    'latest-sales': { label: 'ÚLTIMAS VENDAS', icon: DollarSign },
    goals: { label: 'COUNTDOWN METAS', icon: Target },
    streaks: { label: 'STREAKS & XP', icon: Flame },
  };

  const CurrentIcon = screenLabels[currentScreen].icon;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Controls Header */}
      <Card className="glass border-white/5 overflow-hidden group">
        <div className="bg-white/5 backdrop-blur-xl relative z-10">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                  <Tv className="h-7 w-7 text-primary-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                      Arena Broadcast System
                    </Badge>
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <CardTitle className="text-3xl font-black italic uppercase tracking-tighter gradient-text leading-none">Modo TV Pro</CardTitle>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button size="sm" variant={autoRotate ? 'default' : 'outline'} onClick={() => setAutoRotate(!autoRotate)} className="h-10 px-4 border-white/10 text-xs font-black uppercase tracking-widest rounded-xl">
                  <Timer className="h-4 w-4 mr-2" /> {autoRotate ? 'AUTO-BROADCAST' : 'MANUAL'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSoundEnabled(!soundEnabled)} className="h-10 w-10 border-white/10 rounded-xl p-0">
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={toggleFullscreen} className="h-10 px-4 border-white/10 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-primary-foreground transition-all">
                  <Maximize2 className="h-4 w-4 mr-2" /> FULLSCREEN
                </Button>
              </div>
            </div>
          </CardHeader>
        </div>
      </Card>

      {/* Screen selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {screens.map(screen => {
          const config = screenLabels[screen];
          const isActive = currentScreen === screen;
          return (
            <Button 
              key={screen} 
              size="sm" 
              variant={isActive ? 'default' : 'outline'}
              onClick={() => { setCurrentScreen(screen); setAutoRotate(false); }}
              className={cn(
                "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <config.icon className="h-3.5 w-3.5 mr-2" /> {config.label}
            </Button>
          );
        })}
      </div>

      {/* TV Screen */}
      {/* TV Screen */}
      <Card className="glass border-white/5 min-h-[600px] relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
        <CardContent className="p-10 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div key={currentScreen} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl border border-primary/20">
                <CurrentIcon className="h-8 w-8" />
              </div>
              <span className="text-4xl font-black italic uppercase tracking-tighter gradient-text leading-none">{screenLabels[currentScreen].label}</span>
            </motion.div>
            <div className="flex items-center justify-center gap-3 mt-6">
              {screens.map(s => (
                <div key={s} className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  s === currentScreen ? "w-12 bg-primary shadow-lg shadow-primary/40" : "w-3 bg-white/10"
                )} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentScreen === 'leaderboard' && (
              <motion.div key="lb" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4">
                {salespeople.slice(0, 8).map((sp, i) => (
                  <motion.div key={sp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={cn(
                      'flex items-center gap-6 p-5 rounded-2xl border transition-all duration-500 group/row overflow-hidden relative',
                      i === 0 ? 'bg-rank-gold/10 border-rank-gold/30 shadow-2xl shadow-rank-gold/10' : 'bg-white/5 border-white/5'
                    )}>
                    <div className={cn(
                      "text-3xl font-black italic w-12 text-center drop-shadow-lg",
                      i === 0 ? "text-rank-gold" : "text-muted-foreground/40"
                    )}>
                      {i === 0 ? '01' : i === 1 ? '02' : i === 2 ? '03' : `${i + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-xl italic uppercase tracking-tighter text-foreground">{sp.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-black/40 border-white/10">LVL {sp.level || 1}</Badge>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{sp.role}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-3xl font-black italic tracking-tighter leading-none", i === 0 ? "text-rank-gold" : "text-primary")}>
                        {(sp.xp || 0).toLocaleString()} <span className="text-[10px] font-black uppercase tracking-widest opacity-60">XP</span>
                      </div>
                      {i === 0 && <p className="text-[9px] font-black text-rank-gold uppercase tracking-[0.2em] mt-1">Arena Legend</p>}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {currentScreen === 'latest-sales' && (
              <motion.div key="ls" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                className="space-y-4">
                {latestSales.map((sale, i) => (
                  <motion.div key={sale.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-6 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 group/sale overflow-hidden relative">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.03),transparent)] animate-shimmer" />
                    <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center shadow-2xl relative z-10">
                      <DollarSign className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="font-black text-2xl italic uppercase tracking-tighter text-foreground leading-none mb-2">{sale.client_name}</div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">{sale.product_name}</Badge>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Rocket className="size-3 text-emerald-400" /> {spMap.get(sale.salesperson_id ?? '') || 'Elite Closer'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <div className="text-4xl font-black italic tracking-tighter text-emerald-400 leading-none">
                        R$ {(sale.amount || 0).toLocaleString('pt-BR')}
                      </div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 italic">Transação Verificada</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {currentScreen === 'goals' && (
              <motion.div key="gl" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.slice(0, 6).map((goal, i: number) => {
                  const goalWithAmount = goal as typeof goal & { current_amount?: number };
                  const progress = goal.goal_amount > 0 ? Math.min(((goalWithAmount.current_amount || 0) / goal.goal_amount) * 100, 100) : 0;
                  return (
                    <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card className="glass border-white/5 overflow-hidden group/goal">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                               <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/goal:rotate-6 transition-transform">
                                 <Target className="size-5" />
                               </div>
                               <span className="font-black italic uppercase tracking-tighter text-lg">{goal.salespeople?.name || 'Closer'}</span>
                            </div>
                            <Badge className={cn(
                              "text-[10px] font-black uppercase tracking-widest h-8 px-3",
                              progress >= 100 ? "bg-emerald-500 text-white" : "bg-white/5 border-white/10"
                            )}>
                              {progress.toFixed(0)}% COMPLETE
                            </Badge>
                          </div>
                          <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <motion.div 
                              className={cn("h-full relative", progress >= 100 ? "bg-emerald-500" : "bg-primary")}
                              initial={{ width: 0 }} 
                              animate={{ width: `${progress}%` }} 
                              transition={{ duration: 1.5, ease: 'circOut' }} 
                            >
                               <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
                            </motion.div>
                          </div>
                          <div className="flex justify-between mt-3 px-1">
                            <div className="flex flex-col">
                               <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Atual</span>
                               <span className="text-sm font-black italic text-foreground tracking-tighter">R$ {((goalWithAmount.current_amount || 0) / 1000).toFixed(1)}k</span>
                            </div>
                            <div className="flex flex-col text-right">
                               <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Meta</span>
                               <span className="text-sm font-black italic text-muted-foreground/60 tracking-tighter">R$ {((goal.goal_amount || 0) / 1000).toFixed(1)}k</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
                {goals.length === 0 && <div className="col-span-2 text-center py-12 text-muted-foreground">Nenhuma meta definida</div>}
              </motion.div>
            )}

            {currentScreen === 'streaks' && (
              <motion.div key="st" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {salespeople.slice(0, 8).map((sp, i) => (
                  <motion.div key={sp.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className="text-3xl mb-2">{i < 3 ? '🔥' : '⚡'}</div>
                        <div className="font-semibold text-sm truncate">{sp.name}</div>
                        <div className="text-2xl font-bold text-primary mt-1">Lv.{sp.level || 1}</div>
                        <div className="text-xs text-muted-foreground">{(sp.xp || 0).toLocaleString()} XP</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}


export const EnhancedTVMode = React.memo(EnhancedTVModeComponent);
