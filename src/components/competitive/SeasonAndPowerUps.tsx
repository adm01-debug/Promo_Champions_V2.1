import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Star, Flame, Calendar, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCompetitiveSeasons } from '@/hooks/useCompetitiveSeasons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const powerUpIcons: Record<string, typeof Zap> = {
  xp_boost: Zap,
  streak_shield: Shield,
  double_points: Star,
};

const powerUpLabels: Record<string, string> = {
  xp_boost: 'XP Boost',
  streak_shield: 'Streak Shield',
  double_points: 'Pontos Duplos',
};

const powerUpColors: Record<string, string> = {
  xp_boost: 'from-primary/20 to-accent/10 border-primary/30',
  streak_shield: 'from-success/20 to-success/5 border-success/30',
  double_points: 'from-rank-gold/20 to-rank-gold/5 border-rank-gold/30',
};

const SeasonAndPowerUpsComponent: FC = () => {
  const { currentSeason, powerUps, isLoading } = useCompetitiveSeasons();

  if (isLoading) {
    return <div className="h-48 rounded-xl bg-muted/30 animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      {/* Current Season */}
      {currentSeason ? (
        <Card className="border-none shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/15">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Flame className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{currentSeason.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Temporada {currentSeason.season_number}
                    </p>
                  </div>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Zap className="h-3 w-3 mr-1" />
                  {currentSeason.xp_multiplier}x XP
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Encerra {formatDistanceToNow(new Date(currentSeason.ends_at), { addSuffix: true, locale: ptBR })}</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Flame className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">Nenhuma temporada ativa</p>
            <p className="text-xs text-muted-foreground mt-1">Próxima temporada em breve</p>
          </CardContent>
        </Card>
      )}

      {/* Active Power-Ups */}
      {powerUps && powerUps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            Power-ups Ativos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {powerUps.map((pu, i: number) => {
              const Icon = powerUpIcons[pu.power_up_type] || Zap;
              const color = powerUpColors[pu.power_up_type] || powerUpColors.xp_boost;
              return (
                <motion.div
                  key={pu.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-r',
                    color
                  )}>
                    <Icon className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {powerUpLabels[pu.power_up_type] || pu.power_up_type}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {(pu as Record<string, unknown> & { salespeople?: { name: string } }).salespeople?.name} • {pu.multiplier}x
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(pu.expires_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


export const SeasonAndPowerUps = React.memo(SeasonAndPowerUpsComponent);
