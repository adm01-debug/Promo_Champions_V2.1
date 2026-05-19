import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCollectibleBadges } from '@/hooks/gamification/useCollectibleBadges';

interface BadgesGalleryProps {
  salespersonId?: string;
}

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

const BadgesGalleryComponent: FC<BadgesGalleryProps> = ({ salespersonId }) => {
  const { badgesByCategory, earnedCount, totalCount, leaderboard, isLoading } = useCollectibleBadges(salespersonId);

  if (isLoading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />)}
    </div>;
  }

  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
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

      {/* Badges by Category */}
      {Object.entries(badgesByCategory).map(([category, badges]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {badges.map((badge, i) => {
              const rStyle = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
              const rLabel = RARITY_LABELS[badge.rarity] || RARITY_LABELS.common;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                    rStyle,
                    !badge.earned && 'opacity-40 grayscale',
                    badge.earned && 'hover:scale-105 cursor-default',
                  )}>
                    <span className="text-3xl">{badge.icon}</span>
                    <p className="text-xs font-bold text-foreground text-center leading-tight">{badge.name}</p>
                    <Badge variant="outline" className={cn('text-[9px] h-4', rLabel.color)}>
                      {rLabel.label}
                    </Badge>
                    {badge.description && (
                      <p className="text-[10px] text-muted-foreground text-center leading-tight">{badge.description}</p>
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
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🏅 Ranking de Colecionadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {leaderboard.slice(0, 5).map((sp, i) => (
              <div key={sp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={sp.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{sp.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground flex-1">{sp.name}</span>
                <Badge variant="secondary" className="text-xs">{sp.badgeCount} 🏅</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};


export const BadgesGallery = React.memo(BadgesGalleryComponent);
