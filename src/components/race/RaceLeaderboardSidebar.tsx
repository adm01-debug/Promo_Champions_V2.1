import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';
import { useRacePredictions } from '@/hooks/race/useRacePredictions';
import { NextGoalPanel } from './NextGoalPanel';
import { PredictedRankBadge } from './PredictedRankBadge';
import { RankBadge } from './RankBadge';

interface Props {
  entries: RaceLeaderboardEntry[];
  goalAmount: number;
  currentUserSalespersonId?: string;
  seasonStart?: string;
  seasonEnd?: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
}

export function RaceLeaderboardSidebar({ entries, goalAmount, currentUserSalespersonId, seasonStart, seasonEnd }: Props) {
  const leader = entries[0];
  const predictions = useRacePredictions(entries, { start_date: seasonStart, end_date: seasonEnd });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-3">
        {currentUserSalespersonId && (
          <NextGoalPanel
            entries={entries}
            currentUserSalespersonId={currentUserSalespersonId}
            goalAmount={goalAmount}
            seasonStart={seasonStart}
            seasonEnd={seasonEnd}
          />
        )}
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flag className="w-5 h-5 text-primary" />
          Ranking Champions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence>
          {entries.map((e, i) => {
            const gap = leader && i > 0 ? Number(leader.total_sales) - Number(e.total_sales) : 0;
            return (
              <motion.div
                key={e.car_id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                <RankBadge rank={i + 1} size="md" />
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2"
                  style={{ background: e.primary_color, color: e.secondary_color, borderColor: e.secondary_color }}
                >
                  {e.car_number}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={e.avatar_url ?? undefined} />
                  <AvatarFallback>{e.salesperson_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-1">
                    <p className="text-sm font-semibold truncate">{e.salesperson_name}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <PredictedRankBadge prediction={predictions.get(e.salesperson_id)} />
                      <span className="text-xs text-muted-foreground tabular-nums">{Math.round(Number(e.progress) * 100)}%</span>
                    </div>
                  </div>
                  <Progress value={Number(e.progress) * 100} className="h-1.5 mt-1" />
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{fmt(Number(e.total_sales))}</span>
                    {gap > 0 && <span className="text-[10px] text-destructive">-{fmt(gap)}</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum carro no grid ainda.</p>
        )}
        {goalAmount > 0 && (
          <div className="pt-3 mt-3 border-t text-center text-xs text-muted-foreground">
            Meta da temporada: <strong>{fmt(goalAmount)}</strong>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
