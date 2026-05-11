import React, { FC, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Timer, Trophy, Zap, Plus, Users, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSalesBattles } from '@/hooks/useSalesBattles';
import { BattleCardItem } from './BattleCardItem';
import { CreateBattleDialog } from './CreateBattleDialog';

interface Battle {
  id: string;
  title: string;
  metric: string;
  battle_type: string;
  status: string;
  ends_at: string;
  xp_reward: number;
  winner_id?: string | null;
  battle_participants?: {
    id: string;
    current_score: number;
    salespeople?: { name: string } | null;
  }[];
}

interface BattleArenaProps {
  className?: string;
}

const BattleArenaComponent: FC<BattleArenaProps> = ({ className }) => {
  const { battles, isLoading } = useSalesBattles();
  const [showCreate, setShowCreate] = useState(false);

  const { activeBattles, completedBattles, stats } = useMemo(() => {
    const active = battles?.filter((b: Battle) => b.status === 'active') || [];
    const completed = battles?.filter((b: Battle) => b.status === 'completed') || [];
    const totalParticipants = active.reduce((sum: number, b: Battle) => sum + (b.battle_participants?.length || 0), 0);
    const totalXP = active.reduce((sum: number, b: Battle) => sum + b.xp_reward, 0);
    return {
      activeBattles: active,
      completedBattles: completed,
      stats: { totalParticipants, totalXP, activeCount: active.length, completedCount: completed.length },
    };
  }, [battles]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}
        </div>
        {[1, 2].map(i => <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className={cn('space-y-5', className)}>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Swords, label: 'Ativas', value: stats.activeCount, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Trophy, label: 'Encerradas', value: stats.completedCount, color: 'text-rank-gold', bg: 'bg-rank-gold/10' },
          { icon: Users, label: 'Gladiadores', value: stats.totalParticipants, color: 'text-accent', bg: 'bg-accent/10' },
          { icon: Zap, label: 'XP em Jogo', value: stats.totalXP, color: 'text-streak', bg: 'bg-streak/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="glass border-border/40 hover-lift-sm overflow-hidden group/stat relative">
            <div className={cn("absolute inset-0 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500", bg)} />
            <CardContent className="p-4 flex items-center gap-4 relative z-10">
              <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover/stat:scale-110 group-hover/stat:rotate-6 transition-all duration-500 border border-border/10', bg, color)}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className={cn("text-2xl font-display font-black tracking-tighter italic leading-none mb-1", color)}>{value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Battles */}
      {activeBattles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Swords className="h-4 w-4 text-primary" />
              Batalhas Ativas ({activeBattles.length})
            </h3>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowCreate(true)}>
              <Plus className="h-3 w-3 mr-1" /> Nova Batalha
            </Button>
          </div>
          <AnimatePresence mode="popLayout">
            {activeBattles.map((b: Battle) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <BattleCardItem battle={b} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {!battles?.length && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Swords className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">Sem batalhas ativas</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Gestores podem criar duelos para motivar o time!</p>
            <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-3 w-3 mr-1" /> Criar Primeira Batalha
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completed Battles */}
      {completedBattles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 italic">
              <Trophy className="h-4 w-4" />
              Hall of Fame: Encerradas ({completedBattles.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedBattles.slice(0, 4).map((b: Battle) => (
              <BattleCardItem key={b.id} battle={b} />
            ))}
          </div>
        </div>
      )}

      <CreateBattleDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
};

export const BattleArena = React.memo(BattleArenaComponent);
