import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Timer, Trophy, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useSalesBattles } from '@/hooks/useSalesBattles';

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

const BattleCard: FC<{ battle: Battle }> = ({ battle }) => {
  const countdown = useCountdown(battle.ends_at);
  const participants = battle.battle_participants || [];
  const isActive = battle.status === 'active';
  const maxScore = Math.max(...participants.map((p: BattleParticipant) => p.current_score), 1);

  return (
    <Card className={cn(
      'border-none shadow-lg overflow-hidden transition-all',
      isActive && 'ring-2 ring-primary/30'
    )}>
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
                <Timer className="h-3 w-3 mr-1" />
                {countdown}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {battle.xp_reward} XP
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {participants
          .sort((a: BattleParticipant, b: BattleParticipant) => b.current_score - a.current_score)
          .map((p: BattleParticipant, i: number) => (
            <motion.div
              key={p.id}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                i === 0 && isActive && 'bg-rank-gold/20 text-rank-gold dark:bg-rank-gold/30/30 dark:text-rank-gold',
                i > 0 && 'bg-muted text-muted-foreground'
              )}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium truncate">
                    {p.salespeople?.name || 'Vendedor'}
                  </span>
                  <span className="text-sm font-bold text-primary">{p.current_score}</span>
                </div>
                <Progress
                  value={(p.current_score / maxScore) * 100}
                  className="h-2"
                />
              </div>
              {i === 0 && isActive && (
                <Trophy className="h-4 w-4 text-rank-gold shrink-0 animate-bounce" />
              )}
            </motion.div>
          ))}

        {!isActive && battle.winner_id && (
          <div className="text-center py-2 bg-rank-gold/10/50 dark:bg-rank-gold/30/10 rounded-lg">
            <Trophy className="h-5 w-5 mx-auto text-rank-gold mb-1" />
            <p className="text-xs font-semibold text-foreground">Batalha encerrada!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface BattleArenaProps {
  className?: string;
}

export const BattleArena: FC<BattleArenaProps> = ({ className }) => {
  const { battles, isLoading } = useSalesBattles();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  const activeBattles = battles?.filter((b: Battle) => b.status === 'active') || [];
  const completedBattles = battles?.filter((b: Battle) => b.status === 'completed') || [];

  if (!battles?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Swords className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">Sem batalhas ativas</p>
          <p className="text-xs text-muted-foreground mt-1">Gestores podem criar duelos para motivar o time!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {activeBattles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Swords className="h-4 w-4 text-primary" />
            Batalhas Ativas ({activeBattles.length})
          </h3>
          {activeBattles.map((b: Battle) => <BattleCard key={b.id} battle={b} />)}
        </div>
      )}

      {completedBattles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Encerradas
          </h3>
          {completedBattles.slice(0, 3).map((b: Battle) => <BattleCard key={b.id} battle={b} />)}
        </div>
      )}
    </div>
  );
};
