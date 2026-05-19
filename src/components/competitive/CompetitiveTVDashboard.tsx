import React, { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Trophy, Flame, Swords, TrendingUp, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCompetitiveRanking } from '@/hooks/useCompetitiveRanking';
import { useSalesStreaks } from '@/hooks/sales/useSalesStreaks';
import { useWeeklyMatchups } from '@/hooks/gamification/useWeeklyMatchups';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StreakEntry {
  id: string;
  current_streak: number;
  xp_multiplier?: number;
  salespeople?: { name: string } | null;
}

interface MatchupEntry {
  id: string;
  status: string;
  player1_score?: number;
  player2_score?: number;
  player1?: { name: string } | null;
  player2?: { name: string } | null;
}

const SLIDES = ['ranking', 'streaks', 'matchups', 'stats'] as const;
type _Slide = typeof SLIDES[number];

const SLIDE_DURATION = 8000; // 8s per slide

const CompetitiveTVDashboardComponent: FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { data: ranking } = useCompetitiveRanking();
  const { data: streaks } = useSalesStreaks();
  const { data: matchups } = useWeeklyMatchups();

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const slideKey = SLIDES[currentSlide];
  const now = new Date();

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Dashboard TV</h3>
          <Badge variant="secondary" className="text-xs animate-pulse">AO VIVO</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {SLIDES.map((s, i) => (
              <button
                key={s}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}: ${s}`}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === currentSlide ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30',
                )}
              />
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={toggleFullscreen}>
            <Maximize className="h-3 w-3" />
            {isFullscreen ? 'Sair' : 'Tela Cheia'}
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="relative min-h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/30 border shadow-xl">
        {/* Clock overlay */}
        <div className="absolute top-4 right-4 z-10 text-right">
          <p className="text-2xl font-bold text-foreground tabular-nums">{format(now, 'HH:mm')}</p>
          <p className="text-xs text-muted-foreground">{format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slideKey}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            {slideKey === 'ranking' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="h-6 w-6 text-rank-gold" />
                  <h2 className="text-xl font-bold text-foreground">Ranking do Mês</h2>
                </div>
                <div className="space-y-3">
                  {(ranking || []).slice(0, 8).map((sp, i) => (
                    <motion.div
                      key={sp.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-xl',
                        i === 0 && 'bg-rank-gold/10 border border-rank-gold/30',
                        i === 1 && 'bg-rank-silver/10 border border-rank-silver/20',
                        i === 2 && 'bg-rank-bronze/10 border border-rank-bronze/20',
                        i > 2 && 'bg-muted/20',
                      )}
                    >
                      <span className="text-lg font-bold w-8 text-center">
                        {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={sp.avatar_url || undefined} />
                        <AvatarFallback>{sp.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{sp.name}</p>
                        <p className="text-xs text-muted-foreground">{sp.dealsCount} negócios</p>
                      </div>
                      <p className="text-lg font-bold text-primary">
                        R${sp.totalSales.toLocaleString('pt-BR')}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {slideKey === 'streaks' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <Flame className="h-6 w-6 text-streak" />
                  <h2 className="text-xl font-bold text-foreground">Streaks Ativos</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(streaks || []).filter((s: StreakEntry) => s.current_streak > 0).slice(0, 6).map((streak: StreakEntry, i: number) => (
                    <motion.div
                      key={streak.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-streak/10 to-destructive/10 border border-streak/20"
                    >
                      <div className="text-3xl">🔥</div>
                      <div>
                        <p className="font-bold text-foreground">{streak.salespeople?.name || 'Vendedor'}</p>
                        <p className="text-2xl font-black text-streak">{streak.current_streak} dias</p>
                        <p className="text-xs text-muted-foreground">Multiplicador: {streak.xp_multiplier}x</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {(!streaks || streaks.filter((s: StreakEntry) => s.current_streak > 0).length === 0) && (
                  <div className="text-center py-12">
                    <Flame className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Nenhum streak ativo no momento</p>
                  </div>
                )}
              </div>
            )}

            {slideKey === 'matchups' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <Swords className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Duelos da Semana</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {(matchups || []).filter((m: MatchupEntry) => m.status === 'active').slice(0, 4).map((matchup: MatchupEntry, i: number) => (
                    <motion.div
                      key={matchup.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                    >
                      <div className="text-center flex-1">
                        <p className="font-bold text-foreground">{matchup.player1?.name || '?'}</p>
                        <p className="text-2xl font-black text-primary">{matchup.player1_score}</p>
                      </div>
                      <div className="text-xl font-bold text-muted-foreground">VS</div>
                      <div className="text-center flex-1">
                        <p className="font-bold text-foreground">{matchup.player2?.name || '?'}</p>
                        <p className="text-2xl font-black text-primary">{matchup.player2_score}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {(!matchups || matchups.filter((m: MatchupEntry) => m.status === 'active').length === 0) && (
                  <div className="text-center py-12">
                    <Swords className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Nenhum duelo ativo no momento</p>
                  </div>
                )}
              </div>
            )}

            {slideKey === 'stats' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-6 w-6 text-success" />
                  <h2 className="text-xl font-bold text-foreground">Destaques do Dia</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Vendedores', value: ranking?.length || 0, icon: '👥' },
                    { label: 'Vendas do Mês', value: ranking?.reduce((s, r) => s + r.dealsCount, 0) || 0, icon: '📊' },
                    { label: 'Receita Total', value: `R$${((ranking?.reduce((s, r) => s + r.totalSales, 0) || 0) / 1000).toFixed(0)}k`, icon: '💰' },
                    { label: 'Streaks Ativos', value: streaks?.filter((s: StreakEntry) => s.current_streak > 0).length || 0, icon: '🔥' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex flex-col items-center p-6 rounded-xl bg-muted/20 border"
                    >
                      <span className="text-3xl mb-2">{stat.icon}</span>
                      <p className="text-3xl font-black text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};


export const CompetitiveTVDashboard = React.memo(CompetitiveTVDashboardComponent);
