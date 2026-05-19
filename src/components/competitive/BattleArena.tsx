import React, { FC, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Timer, Trophy, Zap, Plus, Users, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSalesBattles } from '@/hooks/sales/useSalesBattles';
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
    <div className={cn('space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700', className)}>
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Swords, label: 'Ativas', value: stats.activeCount, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
          { icon: Trophy, label: 'Encerradas', value: stats.completedCount, color: 'text-rank-gold', bg: 'bg-rank-gold/10', border: 'border-rank-gold/20' },
          { icon: Users, label: 'Gladiadores', value: stats.totalParticipants, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { icon: Zap, label: 'XP em Jogo', value: stats.totalXP, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <Card key={label} className={cn("glass border-white/5 overflow-hidden group/stat relative transition-all duration-500 hover:scale-[1.02]", border)}>
            <div className={cn("absolute inset-0 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-700", bg)} />
            <CardContent className="p-6 flex items-center gap-5 relative z-10">
              <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-all duration-500 group-hover/stat:rotate-12 border border-white/10', bg, color)}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className={cn("text-3xl font-black italic tracking-tighter leading-none mb-1", color)}>{value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Battles */}
      {activeBattles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 italic">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              Live Battles ({activeBattles.length})
            </h3>
            <Button variant="outline" size="sm" className="h-10 px-6 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-black uppercase tracking-widest rounded-xl" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nova Batalha
            </Button>
          </div>
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBattles.map((b: Battle) => (
                <motion.div key={b.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <BattleCardItem battle={b} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {!battles?.length && (
        <Card className="glass border-dashed border-white/10 bg-white/5">
          <CardContent className="p-16 text-center">
            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
              <Swords className="h-10 w-10 text-muted-foreground/20" />
            </div>
            <p className="text-xl font-black italic uppercase tracking-tighter gradient-text mb-2">Arena Deserta</p>
            <p className="text-sm text-muted-foreground font-medium mb-8">Gestores de elite podem criar duelos para inflamar o time!</p>
            <Button className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-8 h-12 text-xs font-black uppercase tracking-[0.2em] rounded-full shadow-2xl shadow-primary/10" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Iniciar Primeira Batalha
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completed Battles */}
      {completedBattles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2 italic">
              <Trophy className="h-4 w-4" />
              Battle Archive: Hall of Fame
            </h3>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest px-4">
              {completedBattles.length} Records Found
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedBattles.slice(0, 4).map((b: Battle) => (
              <BattleCardItem key={b.id} battle={b} />
            ))}
          </div>
          <div className="flex justify-center pt-4">
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">
               Ver Histórico de Batalhas <TrendingUp className="size-3 ml-2" />
            </Button>
          </div>
        </div>
      )}

      <CreateBattleDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
};

export const BattleArena = React.memo(BattleArenaComponent);
