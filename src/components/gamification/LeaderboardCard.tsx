import { FC } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatXP, getLevelFromXP } from '@/lib/gamification';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  rank: number;
  previousRank?: number;
  streak?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  title?: string;
  showLevel?: boolean;
  showStreak?: boolean;
  maxEntries?: number;
  currentUserId?: string;
  className?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown size={18} className="text-amber-500 fill-amber-500" />;
    case 2: return <Medal size={18} className="text-slate-400" />;
    case 3: return <Medal size={18} className="text-amber-700" />;
    default: return <span className="text-muted-foreground font-mono text-sm">{rank}º</span>;
  }
};

const getRankChange = (current: number, previous?: number) => {
  if (previous === undefined) return null;
  const diff = previous - current;
  if (diff > 0) return <TrendingUp size={14} className="text-green-500" />;
  if (diff < 0) return <TrendingDown size={14} className="text-red-500" />;
  return <Minus size={14} className="text-muted-foreground" />;
};

const getRankBackground = (rank: number) => {
  switch (rank) {
    case 1: return 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30';
    case 2: return 'bg-gradient-to-r from-slate-400/20 via-slate-400/10 to-transparent border-slate-400/30';
    case 3: return 'bg-gradient-to-r from-amber-700/20 via-amber-700/10 to-transparent border-amber-700/30';
    default: return '';
  }
};

export const LeaderboardCard: FC<LeaderboardCardProps> = ({
  entries,
  title = 'Ranking',
  showLevel = true,
  showStreak = false,
  maxEntries = 10,
  currentUserId,
  className
}) => {
  const displayEntries = entries.slice(0, maxEntries);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy size={20} className="text-amber-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {displayEntries.map((entry, index) => {
            const levelInfo = getLevelFromXP(entry.xp);
            const isCurrentUser = entry.isCurrentUser || entry.id === currentUserId;
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                  getRankBackground(entry.rank),
                  isCurrentUser && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Rank change indicator */}
                <div className="w-4">
                  {getRankChange(entry.rank, entry.previousRank)}
                </div>

                {/* Avatar */}
                <Avatar className="h-9 w-9">
                  <AvatarImage src={entry.avatarUrl} alt={entry.name} />
                  <AvatarFallback className="text-xs">
                    {entry.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Level */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isCurrentUser && "text-primary"
                  )}>
                    {entry.name}
                    {isCurrentUser && <span className="ml-1 text-xs">(você)</span>}
                  </p>
                  {showLevel && (
                    <p className="text-xs text-muted-foreground">
                      {levelInfo.emoji} Nível {levelInfo.level} • {levelInfo.title}
                    </p>
                  )}
                </div>

                {/* Streak */}
                {showStreak && entry.streak !== undefined && entry.streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-500">
                    🔥 {entry.streak}
                  </div>
                )}

                {/* XP */}
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatXP(entry.xp)}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {entries.length > maxEntries && (
          <div className="p-3 text-center text-sm text-muted-foreground border-t">
            +{entries.length - maxEntries} participantes
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

export const MiniLeaderboard: FC<MiniLeaderboardProps> = ({
  entries,
  currentUserId: _currentUserId,
  className
}) => {
  const top3 = entries.slice(0, 3);

  return (
    <div className={cn("flex items-end justify-center gap-4", className)}>
      {/* 2nd place */}
      {top3[1] && (
        <div className="flex flex-col items-center">
          <Avatar className="h-12 w-12 border-2 border-slate-400">
            <AvatarImage src={top3[1].avatarUrl} />
            <AvatarFallback>{top3[1].name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="mt-2 w-16 h-16 bg-gradient-to-t from-slate-400 to-slate-300 rounded-t-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-white">2</span>
          </div>
          <p className="text-xs mt-1 truncate max-w-[4rem]">{top3[1].name}</p>
        </div>
      )}

      {/* 1st place */}
      {top3[0] && (
        <div className="flex flex-col items-center">
          <Crown size={24} className="text-amber-500 mb-1" />
          <Avatar className="h-14 w-14 border-2 border-amber-500">
            <AvatarImage src={top3[0].avatarUrl} />
            <AvatarFallback>{top3[0].name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="mt-2 w-20 h-20 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg flex items-center justify-center">
            <span className="text-3xl font-bold text-white">1</span>
          </div>
          <p className="text-xs mt-1 truncate max-w-[5rem] font-medium">{top3[0].name}</p>
        </div>
      )}

      {/* 3rd place */}
      {top3[2] && (
        <div className="flex flex-col items-center">
          <Avatar className="h-10 w-10 border-2 border-amber-700">
            <AvatarImage src={top3[2].avatarUrl} />
            <AvatarFallback>{top3[2].name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="mt-2 w-14 h-12 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg flex items-center justify-center">
            <span className="text-xl font-bold text-white">3</span>
          </div>
          <p className="text-xs mt-1 truncate max-w-[3.5rem]">{top3[2].name}</p>
        </div>
      )}
    </div>
  );
};
