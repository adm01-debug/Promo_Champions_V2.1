import { FC, useEffect, useState } from 'react';
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

export const LiveScoreboard: FC<LiveScoreboardProps> = ({ className }) => {
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
      'space-y-4',
      isFullscreen && 'fixed inset-0 z-50 bg-background p-8 overflow-auto',
      className
    )}>
      <Card className="border-none shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10">
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Monitor className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="block">Placar ao Vivo</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {clock.toLocaleTimeString('pt-BR')} • Atualiza a cada 60s
                  </span>
                </div>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-1.5">
                <Maximize2 className="h-4 w-4" />
                {isFullscreen ? 'Sair' : 'TV Mode'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Team KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl p-4 text-center border border-primary/20">
                <p className="text-2xl font-bold text-primary">
                  R$ {(totalTeamRevenue / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-muted-foreground mt-1">Receita do Time</p>
              </div>
              <div className="bg-gradient-to-br from-success/15 to-success/5 rounded-xl p-4 text-center border border-success/20">
                <p className="text-2xl font-bold text-success">
                  {totalDeals}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Deals Fechados</p>
              </div>
              <div className="bg-gradient-to-br from-coins/15 to-coins/5 rounded-xl p-4 text-center border border-coins/20">
                <p className="text-2xl font-bold text-coins">
                  {ranking?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Competidores</p>
              </div>
            </div>

            {/* Last deal ticker */}
            {lastDeal && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-xl"
              >
                <Flame className="h-4 w-4 text-success animate-pulse" />
                <span className="text-sm text-foreground">
                  <strong>{lastDeal.name}</strong> lidera com{' '}
                  <strong className="text-success">
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
