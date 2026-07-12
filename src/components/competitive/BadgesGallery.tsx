import React, { FC, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Search, Sparkles, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCollectibleBadges, type CollectibleBadge } from '@/hooks/gamification/useCollectibleBadges';

interface BadgesGalleryProps {
  salespersonId?: string;
}

type RarityKey = 'all' | 'legendary' | 'epic' | 'rare' | 'common';

const RARITY_STYLES: Record<string, string> = {
  legendary: 'border-coins/50 bg-coins/5 shadow-coins/20 shadow-lg',
  epic: 'border-primary/40 bg-primary/5 shadow-primary/10 shadow-md',
  rare: 'border-info/30 bg-info/5',
  common: 'border-border/30 bg-muted/20',
};

const RARITY_LABELS: Record<string, { label: string; color: string }> = {
  legendary: { label: 'Lendário', color: 'bg-coins/20 text-coins border-coins/30' },
  epic: { label: 'Épico', color: 'bg-primary/20 text-primary border-primary/30' },
  rare: { label: 'Raro', color: 'bg-info/20 text-info border-info/30' },
  common: { label: 'Comum', color: 'bg-muted text-muted-foreground' },
};

const CATEGORY_LABELS: Record<string, string> = {
  vendas: '💰 Vendas',
  streak: '🔥 Streaks',
  ranking: '🏆 Ranking',
  duelos: '⚔️ Duelos',
  ligas: '🏅 Ligas',
  missoes: '🎯 Missões',
  roda: '🎰 Roda',
  social: '🦋 Social',
  general: '⭐ Geral',
};

const RARITY_FILTERS: { key: RarityKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'legendary', label: 'Lendários' },
  { key: 'epic', label: 'Épicos' },
  { key: 'rare', label: 'Raros' },
  { key: 'common', label: 'Comuns' },
];

type BadgeWithEarned = CollectibleBadge & { earned: boolean };

const BadgesGalleryComponent: FC<BadgesGalleryProps> = ({ salespersonId }) => {
  const { badgesByCategory, earnedBadges, earnedCount, totalCount, leaderboard, isLoading } =
    useCollectibleBadges(salespersonId);

  const [rarity, setRarity] = useState<RarityKey>('all');
  const [query, setQuery] = useState('');
  const [showOnlyEarned, setShowOnlyEarned] = useState(false);
  const [selected, setSelected] = useState<BadgeWithEarned | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: Record<string, BadgeWithEarned[]> = {};
    Object.entries(badgesByCategory).forEach(([cat, items]) => {
      const list = items.filter((b) => {
        if (rarity !== 'all' && b.rarity !== rarity) return false;
        if (showOnlyEarned && !b.earned) return false;
        if (q && !`${b.name} ${b.description ?? ''}`.toLowerCase().includes(q)) return false;
        return true;
      });
      if (list.length) result[cat] = list;
    });
    return result;
  }, [badgesByCategory, rarity, query, showOnlyEarned]);

  const recentUnlocks = useMemo(
    () => earnedBadges.slice(0, 4).filter((b) => !!b.badge),
    [earnedBadges],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-section-title flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rank-gold to-coins flex items-center justify-center">
                <Trophy className="h-4 w-4 text-primary-foreground" />
              </div>
              Coleção de Conquistas
              <Badge variant="secondary" className="ml-auto text-xs">
                {earnedCount}/{totalCount}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPct} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progressPct}% desbloqueado</p>
          </CardContent>
        </div>
      </Card>

      {/* Recent Unlocks */}
      {recentUnlocks.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Desbloqueados recentemente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {recentUnlocks.map((eb) => (
                <motion.button
                  key={eb.id}
                  type="button"
                  onClick={() => eb.badge && setSelected({ ...eb.badge, earned: true })}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-background/60 hover:bg-background/80 transition-colors"
                >
                  <span className="text-lg">{eb.badge?.icon}</span>
                  <span className="text-xs font-semibold">{eb.badge?.name}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar badge por nome ou descrição..."
            className="pl-9"
            aria-label="Buscar badge"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RARITY_FILTERS.map((r) => (
            <Button
              key={r.key}
              size="sm"
              variant={rarity === r.key ? 'default' : 'outline'}
              onClick={() => setRarity(r.key)}
              className="h-8"
            >
              {r.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant={showOnlyEarned ? 'default' : 'outline'}
            onClick={() => setShowOnlyEarned((v) => !v)}
            className="h-8"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            Conquistados
          </Button>
        </div>
      </div>

      {/* Badges by Category */}
      {Object.keys(filtered).length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhum badge encontrado com os filtros atuais.
        </div>
      )}

      {Object.entries(filtered).map(([category, badges]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {badges.map((badge, i) => {
              const rStyle = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
              const rLabel = RARITY_LABELS[badge.rarity] || RARITY_LABELS.common;
              return (
                <motion.button
                  key={badge.id}
                  type="button"
                  onClick={() => setSelected(badge)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: badge.earned ? 1.05 : 1.02 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-left',
                    rStyle,
                    !badge.earned && 'opacity-40 grayscale',
                  )}
                  aria-label={`Ver detalhes do badge ${badge.name}`}
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <p className="text-xs font-bold text-foreground text-center leading-tight">
                    {badge.name}
                  </p>
                  <Badge variant="outline" className={cn('text-[9px] h-4', rLabel.color)}>
                    {rLabel.label}
                  </Badge>
                  {badge.description && (
                    <p className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-2">
                      {badge.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-accent">
                    <Star className="h-3 w-3" />
                    {badge.xp_reward} XP
                  </div>
                  {!badge.earned && (
                    <div className="absolute top-2 right-2">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-section-title text-sm">🏅 Ranking de Colecionadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {leaderboard.slice(0, 5).map((sp, i) => (
              <div
                key={sp.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={sp.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{sp.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground flex-1">{sp.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {sp.badgeCount} 🏅
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Showcase Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{selected.icon}</span>
                    {selected.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selected.description || 'Continue conquistando para desbloquear novos marcos.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex flex-col items-center gap-4">
                  <motion.div
                    animate={
                      selected.earned
                        ? { rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={{ duration: 1.1 }}
                    className={cn(
                      'h-28 w-28 rounded-2xl border-2 flex items-center justify-center text-6xl',
                      RARITY_STYLES[selected.rarity] || RARITY_STYLES.common,
                      !selected.earned && 'opacity-40 grayscale',
                    )}
                  >
                    {selected.earned ? selected.icon : <Lock className="h-10 w-10" />}
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(RARITY_LABELS[selected.rarity]?.color)}
                    >
                      {RARITY_LABELS[selected.rarity]?.label || selected.rarity}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" />
                      {selected.xp_reward} XP
                    </Badge>
                    {CATEGORY_LABELS[selected.category] && (
                      <Badge variant="outline">{CATEGORY_LABELS[selected.category]}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {selected.earned
                      ? '✨ Você já desbloqueou este badge!'
                      : `Meta: ${selected.unlock_condition.replace(/_/g, ' ')} ≥ ${selected.unlock_threshold}`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const BadgesGallery = React.memo(BadgesGalleryComponent);
