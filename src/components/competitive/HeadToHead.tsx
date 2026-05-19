import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Swords, Zap, Trophy, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useWeeklyMatchups } from '@/hooks/gamification/useWeeklyMatchups';

interface HeadToHeadProps {
  className?: string;
}

const HeadToHeadComponent: FC<HeadToHeadProps> = ({ className }) => {
  const { data: matchups, isLoading } = useWeeklyMatchups();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  const active = matchups?.filter(m => m.status === 'active') || [];
  const completed = matchups?.filter(m => m.status === 'completed') || [];

  if (!matchups?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Swords className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">Sem duelos 1v1 esta semana</p>
          <p className="text-xs text-muted-foreground mt-1">Duelos são pareados automaticamente toda segunda-feira</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-destructive to-primary-glow flex items-center justify-center">
              <Swords className="h-4 w-4 text-primary-foreground" />
            </div>
            Head-to-Head Semanal
            <Badge variant="outline" className="text-xs ml-auto">
              Pareamento automático
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {active.map((matchup, i) => {
            const totalScore = matchup.score_a + matchup.score_b || 1;
            const percentA = (matchup.score_a / totalScore) * 100;

            return (
              <motion.div
                key={matchup.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs animate-pulse border-destructive text-destructive">
                    🔴 AO VIVO
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />{matchup.xp_reward} XP
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  {/* Player A */}
                  <div className="flex-1 text-center">
                    <Avatar className="h-12 w-12 mx-auto border-2 border-primary/30 shadow-lg">
                      <AvatarImage src={matchup.salesperson_a.avatar_url || undefined} />
                      <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                        {matchup.salesperson_a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-bold mt-1 truncate text-foreground">{matchup.salesperson_a.name.split(' ')[0]}</p>
                    <p className="text-xl font-black text-primary">{matchup.score_a.toLocaleString('pt-BR')}</p>
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-destructive to-primary-glow flex items-center justify-center shadow-lg">
                      <span className="text-primary-foreground font-black text-sm">VS</span>
                    </div>
                  </div>

                  {/* Player B */}
                  <div className="flex-1 text-center">
                    <Avatar className="h-12 w-12 mx-auto border-2 border-accent/30 shadow-lg">
                      <AvatarImage src={matchup.salesperson_b.avatar_url || undefined} />
                      <AvatarFallback className="text-sm font-bold bg-accent/10 text-accent-foreground">
                        {matchup.salesperson_b.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-bold mt-1 truncate text-foreground">{matchup.salesperson_b.name.split(' ')[0]}</p>
                    <p className="text-xl font-black text-accent-foreground">{matchup.score_b.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-muted">
                  <motion.div
                    className="bg-primary rounded-l-full"
                    initial={{ width: '50%' }}
                    animate={{ width: `${percentA}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="bg-accent"
                    initial={{ width: '50%' }}
                    animate={{ width: `${100 - percentA}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            );
          })}

          {completed.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/20">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Duelos Encerrados
              </p>
              {completed.slice(0, 3).map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 text-sm">
                  <span className={cn('font-bold', m.winner_id === m.salesperson_a.id ? 'text-primary' : 'text-muted-foreground')}>
                    {m.salesperson_a.name.split(' ')[0]} {m.score_a}
                  </span>
                  <span className="text-muted-foreground">vs</span>
                  <span className={cn('font-bold', m.winner_id === m.salesperson_b.id ? 'text-primary' : 'text-muted-foreground')}>
                    {m.score_b} {m.salesperson_b.name.split(' ')[0]}
                  </span>
                  {m.winner_id && <Crown className="h-3 w-3 text-rank-gold ml-auto" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export const HeadToHead = React.memo(HeadToHeadComponent);
