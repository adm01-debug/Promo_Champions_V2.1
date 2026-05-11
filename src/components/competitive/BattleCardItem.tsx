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
      'glass border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/40 relative group',
      isActive && 'ring-2 ring-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.2)]'
    )}>
      {/* Dynamic Glow */}
      <div className={cn(
        "absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-30 transition-opacity duration-1000",
        isActive ? "bg-primary" : "bg-rank-gold"
      )} />

      <CardHeader className="pb-4 border-b border-white/5 relative z-10 bg-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
              <Swords className="h-7 w-7 text-primary-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            </div>
            <div>
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter gradient-text leading-none mb-2">{battle.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-black/40 border-white/10 text-muted-foreground">
                  {battle.metric}
                </Badge>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-black/40 border-white/10 text-muted-foreground">
                  {battle.battle_type}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center md:flex-col md:items-end gap-3">
            {isActive ? (
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border-rose-500/30 px-4 py-1.5 animate-pulse shadow-lg shadow-rose-500/10">
                <Timer className="h-3 w-3 mr-2" /> {countdown}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-white/10 text-muted-foreground border-white/10 px-4 py-1.5">
                FINALIZADO
              </Badge>
            )}
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5">
              <Zap className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{battle.xp_reward} XP</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-6 relative z-10">
        <div className="space-y-4">
          {participants
            .sort((a, b) => b.current_score - a.current_score)
            .map((p, i) => {
              const scorePercent = (p.current_score / maxScore) * 100;
              return (
                <motion.div 
                  key={p.id} 
                  className="relative group/player"
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black italic shadow-2xl border transition-all duration-500 group-hover/player:scale-110',
                      i === 0 && isActive ? 'bg-rank-gold text-white border-rank-gold/50 shadow-rank-gold/20' : 'bg-white/5 text-muted-foreground border-white/5'
                    )}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black italic uppercase tracking-tighter truncate group-hover/player:text-primary transition-colors">{p.salespeople?.name || 'Gladiador'}</span>
                          {i === 0 && isActive && <Sparkles className="size-3 text-rank-gold animate-pulse" />}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className={cn(
                            "text-2xl font-black italic tracking-tighter leading-none",
                            i === 0 ? "text-rank-gold" : "text-primary"
                          )}>{p.current_score}</span>
                          <span className="text-[9px] font-black text-muted-foreground/60 uppercase">pts</span>
                        </div>
                      </div>
                      <div className="relative h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${scorePercent}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className={cn(
                            "absolute h-full relative transition-all duration-1000",
                            i === 0 ? "bg-gradient-to-r from-rank-gold to-yellow-400" : "bg-gradient-to-r from-primary to-accent"
                          )}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
                        </motion.div>
                      </div>
                    </div>
                    {i === 0 && isActive && (
                      <div className="p-2.5 rounded-2xl bg-rank-gold/10 animate-bounce shadow-lg shadow-rank-gold/10 border border-rank-gold/20">
                        <Trophy className="h-6 w-6 text-rank-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </div>

        {!isActive && battle.winner_id && (
          <div className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-rank-gold/20 via-rank-gold/5 to-transparent border border-rank-gold/30 text-center relative overflow-hidden group/winner shadow-2xl shadow-rank-gold/10">
            <div className="absolute inset-0 bg-rank-gold/5 animate-pulse opacity-50" />
            <div className="relative z-10">
              <div className="size-16 rounded-full bg-rank-gold/20 flex items-center justify-center mx-auto mb-4 border border-rank-gold/30 group-hover/winner:scale-110 group-hover/winner:rotate-12 transition-transform duration-700 shadow-2xl">
                <Trophy className="h-8 w-8 text-rank-gold drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rank-gold mb-2">Champion Hall of Fame</p>
              <p className="text-3xl font-black italic uppercase tracking-tighter text-foreground drop-shadow-lg">
                {participants.find(p => p.salespeople?.name && (p.id === battle.winner_id || p.salespeople.name === battle.winner_id))?.salespeople?.name || 'Elite Legend'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
  );
});

BattleCardItem.displayName = 'BattleCardItem';
