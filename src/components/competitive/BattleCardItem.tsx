import React, { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Timer, Trophy, Zap, Sparkles } from 'lucide-react';
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
    <Card className={cn(
      'glass border-border/40 overflow-hidden transition-all duration-500 hover:border-primary/40 relative group',
      isActive && 'ring-2 ring-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.15)]'
    )}>
      {/* Dynamic Glow */}
      <div className={cn(
        "absolute top-0 right-0 w-40 h-40 blur-[80px] rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-20 transition-opacity duration-700",
        isActive ? "bg-primary" : "bg-rank-gold"
      )} />

      <CardHeader className="pb-3 border-b border-border/10 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-500">
              <Swords className="h-5 w-5 text-primary-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            </div>
            <div>
              <CardTitle className="text-base font-display font-black tracking-tight uppercase italic gradient-text">{battle.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-muted/30 border-none text-muted-foreground/80">
                  {battle.metric}
                </Badge>
                <div className="w-1 h-1 rounded-full bg-border" />
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-muted/30 border-none text-muted-foreground/80">
                  {battle.battle_type}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {isActive ? (
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 animate-pulse">
                <Timer className="h-3 w-3 mr-1.5" /> {countdown}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-muted/50 text-muted-foreground border-none px-3 py-1">
                FINALIZADO
              </Badge>
            )}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-streak/10 border border-streak/20">
              <Zap className="h-3 w-3 text-streak animate-pulse" />
              <span className="text-[10px] font-black text-streak uppercase tracking-widest">{battle.xp_reward} XP</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-5 relative z-10">
        {participants
          .sort((a, b) => b.current_score - a.current_score)
          .map((p, i) => (
            <motion.div 
              key={p.id} 
              className="relative"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className={cn(
                  'h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black italic shadow-inner border border-border/10',
                  i === 0 && isActive ? 'bg-rank-gold text-white shadow-rank-gold/20' : 'bg-muted/50 text-muted-foreground'
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-black uppercase tracking-tight italic truncate pr-4">{p.salespeople?.name || 'Vendedor'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-display font-black text-primary italic leading-none">{p.current_score}</span>
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Pts</span>
                    </div>
                  </div>
                  <div className="relative h-2.5 bg-muted/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div 
                      className={cn(
                        "absolute h-full transition-all duration-1000 ease-out",
                        i === 0 ? "bg-gradient-to-r from-rank-gold to-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.3)]" : "bg-gradient-to-r from-primary to-primary/40"
                      )}
                      style={{ width: `${(p.current_score / maxScore) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
                    </div>
                  </div>
                </div>
                {i === 0 && isActive && (
                  <div className="p-2 rounded-lg bg-rank-gold/10 animate-bounce">
                    <Trophy className="h-5 w-5 text-rank-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}

        {!isActive && battle.winner_id && (
          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-rank-gold/10 to-transparent border border-rank-gold/20 text-center relative overflow-hidden group/winner">
            <div className="absolute inset-0 bg-rank-gold/5 animate-pulse opacity-50" />
            <Trophy className="h-8 w-8 mx-auto text-rank-gold mb-2 drop-shadow-[0_0_12px_rgba(255,215,0,0.5)] group-hover/winner:scale-125 transition-transform duration-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rank-gold mb-1">Grande Vencedor</p>
            <p className="text-xl font-display font-black text-foreground italic tracking-tighter">
              {participants.find(p => p.salespeople?.name && (p.id === battle.winner_id || p.salespeople.name === battle.winner_id))?.salespeople?.name || 'Elite Legend'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

BattleCardItem.displayName = 'BattleCardItem';
