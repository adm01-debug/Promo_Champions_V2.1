import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, TrendingDown, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLeagues, useJoinLeague, LEAGUE_CONFIG, LeagueTier } from '@/hooks/useLeagues';
import { toast } from 'sonner';

interface LeagueSystemProps {
  className?: string;
}

const LEAGUE_ORDER: LeagueTier[] = ['legendary', 'diamond', 'gold', 'silver', 'bronze'];

const LeagueSystemComponent: FC<LeagueSystemProps> = ({ className }) => {
  const { data: members, isLoading } = useLeagues();
  const joinLeague = useJoinLeague();

  const handleJoinLeague = (salespersonId: string, leagueId: string) => {
    joinLeague.mutate({ salespersonId, leagueId }, {
      onSuccess: () => toast.success("Entrou na liga!"),
      onError: () => toast.error("Erro ao entrar na liga"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  const groupedByLeague = LEAGUE_ORDER.reduce((acc, league) => {
    acc[league] = members?.filter(m => m.league === league) || [];
    return acc;
  }, {} as Record<LeagueTier, typeof members>);

  return (
    <div className={cn('space-y-4', className)}>
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-info flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            Sistema de Ligas
            <Badge variant="outline" className="text-xs ml-auto">
              Promoção/Rebaixamento mensal
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* League progression visual */}
          <div className="flex items-center gap-2 justify-center py-2">
            {LEAGUE_ORDER.slice().reverse().map((league, i) => {
              const config = LEAGUE_CONFIG[league];
              const count = groupedByLeague[league]?.length || 0;
              return (
                <div key={league} className="flex flex-col items-center gap-1">
                  {i > 0 && <div className="hidden" />}
                  <div className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-primary-foreground shadow-md text-lg',
                    config.color
                  )}>
                    {config.emoji}
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{config.label}</span>
                  <Badge variant="outline" className="text-[9px] h-4 px-1">{count}</Badge>
                </div>
              );
            })}
          </div>

          {/* League groups */}
          {LEAGUE_ORDER.map(league => {
            const config = LEAGUE_CONFIG[league];
            const leagueMembers = groupedByLeague[league] || [];
            if (leagueMembers.length === 0) return null;

            const nextLeagueIdx = LEAGUE_ORDER.indexOf(league) - 1;
            const nextLeague = nextLeagueIdx >= 0 ? LEAGUE_ORDER[nextLeagueIdx] : null;
            const nextMinPoints = nextLeague ? LEAGUE_CONFIG[nextLeague].minPoints : null;

            return (
              <div key={league} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{config.emoji}</span>
                  <h3 className="text-sm font-bold text-foreground">Liga {config.label}</h3>
                  <div className={cn('h-0.5 flex-1 rounded bg-gradient-to-r', config.color, 'opacity-30')} />
                </div>

                {leagueMembers.map((member, i) => (
                  <motion.div
                    key={member.salesperson_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                      {i + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate text-foreground">{member.name}</span>
                        {member.promoted_at && (
                          <TrendingUp className="h-3 w-3 text-success shrink-0" />
                        )}
                        {member.demoted_at && (
                          <TrendingDown className="h-3 w-3 text-destructive shrink-0" />
                        )}
                      </div>
                      {nextMinPoints && (
                        <Progress
                          value={Math.min((member.points / nextMinPoints) * 100, 100)}
                          className="h-1 mt-1"
                        />
                      )}
                    </div>

                    <span className="text-xs font-bold text-primary">{member.points} pts</span>
                  </motion.div>
                ))}
              </div>
            );
          })}

          {!members?.length && (
            <div className="text-center py-6 space-y-3">
              <Shield className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Sistema de ligas será ativado na próxima temporada</p>
              <Button size="sm" className="gap-2" variant="outline" onClick={() => toast.info("Aguarde a próxima temporada para entrar em uma liga")}>
                <LogIn className="h-4 w-4" /> Entrar na Liga
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export const LeagueSystem = React.memo(LeagueSystemComponent);
