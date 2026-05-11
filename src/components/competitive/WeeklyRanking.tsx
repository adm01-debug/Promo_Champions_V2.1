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
    <div className={cn('space-y-4', className)}>
      {/* Podium */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rank-gold to-coins flex items-center justify-center">
              <Crown className="h-4 w-4 text-primary-foreground" />
            </div>
            Ranking Semanal
            <Badge variant="outline" className="text-xs ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Reseta toda segunda
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {topThree.map((person, i) => {
              const config = PODIUM_CONFIG[person.rank];
              const Icon = config?.icon || TrendingUp;
              return (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    i === 0 && 'bg-gradient-to-r from-rank-gold/10 to-coins/5 border-rank-gold/30 shadow-md',
                    i === 1 && 'bg-gradient-to-r from-rank-silver/10 to-rank-silver/5 border-rank-silver/30',
                    i === 2 && 'bg-gradient-to-r from-streak/10 to-rank-bronze/5 border-streak/30',
                  )}
                >
                  <div className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-primary-foreground shadow-lg',
                    config?.gradient || 'from-muted to-muted'
                  )}>
                    <Icon className={cn('h-5 w-5', i === 0 && 'animate-bounce')} />
                  </div>

                  <Avatar className="h-9 w-9 border-2 border-background shadow">
                    <AvatarImage src={person.avatar_url || undefined} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{person.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {config?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={(person.weeklySales / maxSales) * 100} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{person.dealsCount} deals</span>
                    </div>
                  </div>

                  <p className={cn('font-bold text-right', i === 0 ? 'text-lg text-rank-gold' : 'text-sm text-foreground')}>
                    R$ {person.weeklySales.toLocaleString('pt-BR')}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Rest of the ranking */}
          {rest.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/20">
              {rest.map(person => (
                <div key={person.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground w-6 text-center">#{person.rank}</span>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={person.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px] bg-muted">{person.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground flex-1 truncate">{person.name}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    R$ {person.weeklySales.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {(!ranking?.length || ranking[0].weeklySales === 0) && (
            <div className="text-center py-6">
              <Trophy className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma venda esta semana ainda. Quem será o primeiro? 🚀</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export const WeeklyRanking = React.memo(WeeklyRankingComponent);
