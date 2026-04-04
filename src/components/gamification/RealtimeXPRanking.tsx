import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Crown,
  Medal,
  Award,
  Flame
} from "lucide-react";
import { useGamificationData, SalespersonGamificationData } from "@/hooks/useGamificationData";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getLevelInfo } from "@/hooks/useSalespersonXP";

interface RankPosition {
  current: number;
  previous: number;
  change: 'up' | 'down' | 'same';
  positionsChanged: number;
}

interface RankedSalesperson extends SalespersonGamificationData {
  rank: RankPosition;
}

export function RealtimeXPRanking() {
  const { data: gamificationData, isLoading, refetch } = useGamificationData();
  const [rankedData, setRankedData] = useState<RankedSalesperson[]>([]);
  const previousRanksRef = useRef<Map<string, number>>(new Map());
  const [recentChanges, setRecentChanges] = useState<Set<string>>(new Set());

  // Process initial data and track rank changes
  useEffect(() => {
    if (!gamificationData) return;

    const newRankedData = gamificationData.map((sp, index) => {
      const currentRank = index + 1;
      const previousRank = previousRanksRef.current.get(sp.salesperson_id) || currentRank;
      
      let change: 'up' | 'down' | 'same' = 'same';
      let positionsChanged = 0;
      
      if (previousRank > currentRank) {
        change = 'up';
        positionsChanged = previousRank - currentRank;
      } else if (previousRank < currentRank) {
        change = 'down';
        positionsChanged = currentRank - previousRank;
      }

      return {
        ...sp,
        rank: {
          current: currentRank,
          previous: previousRank,
          change,
          positionsChanged
        }
      };
    });

    // Update previous ranks
    newRankedData.forEach(sp => {
      previousRanksRef.current.set(sp.salesperson_id, sp.rank.current);
    });

    setRankedData(newRankedData);
  }, [gamificationData]);

  // Subscribe to real-time XP changes
  useEffect(() => {
    const channel = supabase
      .channel('xp-ranking-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'salesperson_xp'
        },
        (payload) => {
          const salespersonId = (payload.new as any)?.salesperson_id;
          if (salespersonId) {
            setRecentChanges(prev => new Set([...prev, salespersonId]));
            // Clear highlight after animation
            setTimeout(() => {
              setRecentChanges(prev => {
                const next = new Set(prev);
                next.delete(salespersonId);
                return next;
              });
            }, 2000);
          }
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-rank-gold" />;
      case 2:
        return <Medal className="h-5 w-5 text-rank-silver" />;
      case 3:
        return <Award className="h-5 w-5 text-rank-bronze" />;
      default:
        return <span className="text-sm font-mono text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-rank-gold/20 to-rank-gold/5 border-rank-gold/30";
      case 2:
        return "bg-gradient-to-r from-rank-silver/20 to-rank-silver/5 border-rank-silver/30";
      case 3:
        return "bg-gradient-to-r from-rank-bronze/20 to-rank-bronze/5 border-rank-bronze/30";
      default:
        return "bg-muted/30 border-border/30";
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Trophy className="h-4 w-4 text-coins" />
            Ranking de XP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/40 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Trophy className="h-4 w-4 text-coins" />
            Ranking de XP
            <Badge variant="outline" className="ml-2 text-[10px] bg-success/10 text-success border-success/20">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success mr-1 animate-pulse" />
              Ao vivo
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px]">
          <div className="p-4 pt-0 space-y-2">
            <AnimatePresence mode="popLayout">
              {rankedData.map((sp, index) => {
                const levelInfo = getLevelInfo(sp.level);
                const isHighlighted = recentChanges.has(sp.salesperson_id);
                
                return (
                  <motion.div
                    key={sp.salesperson_id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: isHighlighted ? [1, 1.02, 1] : 1
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                      duration: 0.3
                    }}
                    className={cn(
                      "relative p-3 rounded-lg border transition-all duration-300",
                      getRankBadgeClass(sp.rank.current),
                      isHighlighted && "ring-2 ring-xp/50 shadow-glow-xp"
                    )}
                  >
                    {/* Highlight effect */}
                    {isHighlighted && (
                      <motion.div
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-xp/10 rounded-lg"
                      />
                    )}

                    <div className="flex items-center gap-3 relative">
                      {/* Rank */}
                      <div className="flex flex-col items-center w-8">
                        {getRankIcon(sp.rank.current)}
                        {sp.rank.change !== 'same' && (
                          <motion.div
                            initial={{ opacity: 0, y: sp.rank.change === 'up' ? 5 : -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-0.5 mt-0.5"
                          >
                            {sp.rank.change === 'up' ? (
                              <>
                                <TrendingUp className="h-3 w-3 text-success" />
                                <span className="text-[10px] text-success">+{sp.rank.positionsChanged}</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-3 w-3 text-destructive" />
                                <span className="text-[10px] text-destructive">-{sp.rank.positionsChanged}</span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={sp.avatar_url || undefined} />
                        <AvatarFallback className="text-xs font-medium bg-muted">
                          {sp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{sp.name}</span>
                          <span className="text-xs">{levelInfo.emoji}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Nv.{sp.level}</span>
                          <span>•</span>
                          <span>{levelInfo.title}</span>
                          {sp.currentStreak > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-streak">
                                <Flame className="h-3 w-3" />
                                {sp.currentStreak}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* XP */}
                      <div className="text-right">
                        <motion.div 
                          className="flex items-center gap-1 text-xp font-mono font-bold"
                          animate={isHighlighted ? { scale: [1, 1.1, 1] } : {}}
                        >
                          <Zap className="h-3.5 w-3.5" />
                          {sp.totalXP.toLocaleString()}
                        </motion.div>
                        <div className="text-[10px] text-muted-foreground">
                          {sp.dailyGoalsAchieved} metas
                        </div>
                      </div>
                    </div>

                    {/* XP Progress bar */}
                    <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((sp.xpInLevel / sp.xpToNext) * 100, 100)}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="h-full bg-gradient-xp rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
