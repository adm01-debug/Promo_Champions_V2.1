import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Trophy, Flame, DollarSign, Target, Timer, Volume2, VolumeX, Sparkles, Zap, Rocket, Star, TrendingUp } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" /> Modo TV Competitivo
          </h2>
          <p className="text-sm text-muted-foreground">Dashboard para TV do escritório com rotação automática</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={autoRotate ? 'default' : 'outline'} onClick={() => setAutoRotate(!autoRotate)}>
            <Timer className="h-4 w-4 mr-1" /> {autoRotate ? 'Auto' : 'Manual'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={toggleFullscreen}>
            <Monitor className="h-4 w-4 mr-1" /> Fullscreen
          </Button>
        </div>
      </div>

      {/* Screen selector */}
      <div className="flex gap-2">
        {screens.map(screen => {
          const config = screenLabels[screen];
          return (
            <Button key={screen} size="sm" variant={currentScreen === screen ? 'default' : 'ghost'}
              onClick={() => { setCurrentScreen(screen); setAutoRotate(false); }}>
              <config.icon className="h-3.5 w-3.5 mr-1" /> {config.label}
            </Button>
          );
        })}
      </div>

      {/* TV Screen */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border-2 min-h-[400px]">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div key={currentScreen} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-2xl font-display font-bold">
              <CurrentIcon className="h-7 w-7 text-primary" />
              <span className="gradient-text">{screenLabels[currentScreen].label}</span>
            </motion.div>
            <div className="flex items-center justify-center gap-2 mt-2">
              {screens.map(s => (
                <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s === currentScreen ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentScreen === 'leaderboard' && (
              <motion.div key="lb" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className="space-y-3">
                {salespeople.slice(0, 8).map((sp, i) => (
                  <motion.div key={sp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-4 p-3 rounded-xl ${i < 3 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/20'}`}>
                    <div className="text-2xl font-bold w-8 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{sp.name}</div>
                      <div className="text-sm text-muted-foreground">Nível {sp.level || 1} · {sp.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{(sp.xp || 0).toLocaleString()} XP</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {currentScreen === 'latest-sales' && (
              <motion.div key="ls" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className="space-y-3">
                {latestSales.map((sale, i) => (
                  <motion.div key={sale.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20">
                     <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                       <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{sale.client_name}</div>
                      <div className="text-sm text-muted-foreground">{sale.product_name} · {spMap.get(sale.salesperson_id ?? '') || 'N/A'}</div>
                    </div>
                    <div className="text-xl font-bold text-success">
                      R$ {(sale.amount || 0).toLocaleString('pt-BR')}
                    </div>
                  </motion.div>
                ))}
                {latestSales.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">Nenhuma venda recente</div>
                )}
              </motion.div>
            )}

            {currentScreen === 'goals' && (
              <motion.div key="gl" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.slice(0, 6).map((goal, i: number) => {
                  const goalWithAmount = goal as typeof goal & { current_amount?: number };
                  const progress = goal.goal_amount > 0 ? Math.min(((goalWithAmount.current_amount || 0) / goal.goal_amount) * 100, 100) : 0;
                  return (
                    <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{goal.salespeople?.name || 'N/A'}</span>
                            <Badge variant={progress >= 100 ? 'default' : 'outline'}>{progress.toFixed(0)}%</Badge>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>R$ {((goalWithAmount.current_amount || 0) / 1000).toFixed(1)}k</span>
                            <span>R$ {((goal.goal_amount || 0) / 1000).toFixed(1)}k</span>
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
