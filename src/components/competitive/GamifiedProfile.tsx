import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Shield, Award, Swords, Star, TrendingUp, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGamifiedProfile } from '@/hooks/gamification/useGamifiedProfile';
import { MyRaceCarMiniCard } from '@/components/profile/MyRaceCarMiniCard';

interface GamifiedProfileProps {
  salespersonId?: string;
}

const LEAGUE_STYLES: Record<string, { color: string; icon: string }> = {
  bronze: { color: 'from-rank-bronze to-rank-bronze/80', icon: '🥉' },
  silver: { color: 'from-rank-silver to-rank-silver/80', icon: '🥈' },
  gold: { color: 'from-rank-gold to-coins', icon: '🥇' },
  diamond: { color: 'from-info to-accent', icon: '💎' },
};

const XP_PER_LEVEL = 500;

const GamifiedProfileComponent: FC<GamifiedProfileProps> = ({ salespersonId }) => {
  const { data: profile, isLoading } = useGamifiedProfile(salespersonId);

  if (isLoading) {
    return <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />;
  }

  if (!profile) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Award className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Faça login para ver seu perfil gamificado</p>
        </CardContent>
      </Card>
    );
  }

  const level = Math.floor(profile.totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = profile.totalXp % XP_PER_LEVEL;
  const xpPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
  const leagueStyle = LEAGUE_STYLES[profile.league || 'bronze'] || LEAGUE_STYLES.bronze;

  const stats = [
    { label: 'Ranking', value: `#${profile.rank}`, icon: <Trophy className="h-4 w-4" />, color: 'text-coins' },
    { label: 'Vendas/Mês', value: `R$${(profile.totalSales / 1000).toFixed(0)}k`, icon: <TrendingUp className="h-4 w-4" />, color: 'text-success' },
    { label: 'Deals', value: profile.dealsCount, icon: <Star className="h-4 w-4" />, color: 'text-info' },
    { label: 'Streak', value: `${profile.currentStreak}🔥`, icon: <Flame className="h-4 w-4" />, color: 'text-streak' },
    { label: 'Badges', value: profile.badgeCount, icon: <Award className="h-4 w-4" />, color: 'text-primary' },
    { label: 'H2H', value: `${profile.h2hWins}W/${profile.h2hLosses}L`, icon: <Swords className="h-4 w-4" />, color: 'text-destructive' },
    { label: 'Kudos', value: profile.kudosReceived, icon: <Heart className="h-4 w-4" />, color: 'text-live-pulse' },
    { label: 'Liga Pts', value: profile.leaguePoints, icon: <Shield className="h-4 w-4" />, color: 'text-accent' },
  ];

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-none shadow-xl overflow-hidden">
          <div className={cn('bg-gradient-to-r p-6', leagueStyle.color)}>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-3 ring-primary-foreground/30">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-xl font-bold">{profile.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-primary-foreground">
                <h2 className="text-xl font-black">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-xs">
                    Nv.{level}
                  </Badge>
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-xs">
                    {leagueStyle.icon} {(profile.league || 'bronze').charAt(0).toUpperCase() + (profile.league || 'bronze').slice(1)}
                  </Badge>
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-xs">
                    #{profile.rank}
                  </Badge>
                </div>
              </div>
            </div>
            {/* XP Bar */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-primary-foreground/80">
                <span>XP: {profile.totalXp.toLocaleString('pt-BR')}</span>
                <span>Nível {level} → {level + 1}</span>
              </div>
              <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-primary-foreground/80 rounded-full"
                />
              </div>
              <p className="text-[10px] text-primary-foreground/60 text-right">{xpInLevel}/{XP_PER_LEVEL} XP</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Race Arena mini card */}
      <MyRaceCarMiniCard salespersonId={salespersonId} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-3 flex flex-col items-center gap-1">
                <div className={cn('', stat.color)}>{stat.icon}</div>
                <p className="text-lg font-black text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Records */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-bold text-foreground">📊 Recordes Pessoais</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-[10px] text-muted-foreground">Maior Streak</p>
              <p className="text-lg font-black text-foreground">{profile.longestStreak} dias 🔥</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-[10px] text-muted-foreground">Taxa H2H</p>
              <p className="text-lg font-black text-foreground">
                {profile.h2hWins + profile.h2hLosses > 0
                  ? `${Math.round((profile.h2hWins / (profile.h2hWins + profile.h2hLosses)) * 100)}%`
                  : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export const GamifiedProfile = React.memo(GamifiedProfileComponent);
