import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';
import { NextGoalPanel } from './NextGoalPanel';

interface Props {
  entries: RaceLeaderboardEntry[];
  goalAmount: number;
  currentUserSalespersonId?: string;
}

const POSITION_ICON = [
  { Icon: Trophy, color: 'text-yellow-500' },
  { Icon: Medal, color: 'text-slate-400' },
  { Icon: Award, color: 'text-orange-500' },
];

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
}

export function RaceLeaderboardSidebar({ entries, goalAmount, currentUserSalespersonId }: Props) {
  const leader = entries[0];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-3">
        {currentUserSalespersonId && (
          <NextGoalPanel
            entries={entries}
            currentUserSalespersonId={currentUserSalespersonId}
            goalAmount={goalAmount}
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
            const positionMeta = POSITION_ICON[i];
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
                <div className="flex flex-col items-center w-8">
                  {positionMeta ? (
                    <positionMeta.Icon className={`w-5 h-5 ${positionMeta.color}`} />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">{i + 1}º</span>
                  )}
                </div>
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
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-semibold truncate">{e.salesperson_name}</p>
                    <span className="text-xs text-muted-foreground tabular-nums">{Math.round(Number(e.progress) * 100)}%</span>
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
