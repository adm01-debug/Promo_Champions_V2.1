import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy } from "lucide-react";
import { useGamificationData, SalespersonGamificationData } from "@/hooks/gamification/useGamificationData";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence } from "framer-motion";
import { XPRankingRow } from "./XPRankingRow";

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

  useEffect(() => {
    if (!gamificationData) return;
    const newRankedData = gamificationData.map((sp, index) => {
      const currentRank = index + 1;
      const previousRank = previousRanksRef.current.get(sp.salesperson_id) || currentRank;
      let change: 'up' | 'down' | 'same' = 'same';
      let positionsChanged = 0;
      if (previousRank > currentRank) { change = 'up'; positionsChanged = previousRank - currentRank; }
      else if (previousRank < currentRank) { change = 'down'; positionsChanged = currentRank - previousRank; }
      return { ...sp, rank: { current: currentRank, previous: previousRank, change, positionsChanged } };
    });
    newRankedData.forEach(sp => { previousRanksRef.current.set(sp.salesperson_id, sp.rank.current); });
    setRankedData(newRankedData);
  }, [gamificationData]);

  useEffect(() => {
    const channel = supabase.channel('xp-ranking-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'salesperson_xp' }, (payload) => {
      const salespersonId = (payload.new as Record<string, unknown>)?.salesperson_id as string | undefined;
      if (salespersonId) {
        setRecentChanges(prev => new Set([...prev, salespersonId]));
        setTimeout(() => { setRecentChanges(prev => { const next = new Set(prev); next.delete(salespersonId); return next; }); }, 2000);
      }
      refetch();
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  if (isLoading) {
    return (
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-3"><CardTitle className="text-base font-display flex items-center gap-2"><Trophy className="h-4 w-4 text-coins" />Ranking de XP</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-6 w-20" /></div>))}</div></CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/40 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Trophy className="h-4 w-4 text-coins" />Ranking de XP
            <Badge variant="outline" className="ml-2 text-[10px] bg-success/10 text-success border-success/20"><span className="inline-block h-1.5 w-1.5 rounded-full bg-success mr-1 animate-pulse" />Ao vivo</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px]">
          <div className="p-4 pt-0 space-y-2">
            <AnimatePresence mode="popLayout">
              {rankedData.map((sp, index) => (
                <XPRankingRow key={sp.salesperson_id} {...sp} isHighlighted={recentChanges.has(sp.salesperson_id)} index={index} rank={sp.rank} />
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
