import React, { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Timer, Trophy, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BattleParticipant {
  id: string;
  current_score: number;
  salespeople?: { name: string } | null;
}

interface Battle {
  id: string;
  title: string;
  metric: string;
  battle_type: string;
  status: string;
  ends_at: string;
  xp_reward: number;
  winner_id?: string | null;
  battle_participants?: BattleParticipant[];
}

function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Encerrado'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return timeLeft;
}

export const BattleCardItem: FC<{ battle: Battle }> = React.memo(({ battle }) => {
  const countdown = useCountdown(battle.ends_at);
  const participants = battle.battle_participants || [];
  const isActive = battle.status === 'active';
  const maxScore = Math.max(...participants.map(p => p.current_score), 1);

  return (
    <Card className={cn('border-none shadow-lg overflow-hidden transition-all', isActive && 'ring-2 ring-primary/30')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Swords className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm">{battle.title}</CardTitle>
              <p className="text-xs text-muted-foreground capitalize">{battle.metric} • {battle.battle_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <Badge variant="outline" className="text-xs animate-pulse border-destructive text-destructive">
                <Timer className="h-3 w-3 mr-1" />{countdown}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />{battle.xp_reward} XP
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants
          .sort((a, b) => b.current_score - a.current_score)
          .map((p, i) => (
            <motion.div key={p.id} className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                i === 0 && isActive ? 'bg-rank-gold/20 text-rank-gold' : 'bg-muted text-muted-foreground'
              )}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium truncate">{p.salespeople?.name || 'Vendedor'}</span>
                  <span className="text-sm font-bold text-primary">{p.current_score}</span>
                </div>
                <Progress value={(p.current_score / maxScore) * 100} className="h-2" />
              </div>
              {i === 0 && isActive && <Trophy className="h-4 w-4 text-rank-gold shrink-0 animate-bounce" />}
            </motion.div>
          ))}
        {!isActive && battle.winner_id && (
          <div className="text-center py-2 bg-rank-gold/10 rounded-lg">
            <Trophy className="h-5 w-5 mx-auto text-rank-gold mb-1" />
            <p className="text-xs font-semibold text-foreground">Batalha encerrada!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

BattleCardItem.displayName = 'BattleCardItem';
