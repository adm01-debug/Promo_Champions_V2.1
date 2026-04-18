import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { METRIC_LABELS, type MetricCode, type ScoringRule } from '@/hooks/race/useRaceScoringRules';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';
import { Info } from 'lucide-react';

interface Props {
  entry: RaceLeaderboardEntry;
  rules: ScoringRule[];
}

function rawValueFor(entry: RaceLeaderboardEntry, code: MetricCode): number {
  switch (code) {
    case 'sales_value':
    case 'sales_value_originated':
      return Number(entry.total_sales ?? 0);
    case 'markup_pct':
      return Number(entry.total_sales ?? 0) * 0.3;
    case 'new_clients_activated':
    case 'stakeholders_captured':
      return Number(entry.new_clients_count ?? 0);
    case 'routine_compliance':
      return Number(entry.activities_count ?? 0);
    case 'conversations_initiated':
      return Number(entry.conversations_count ?? 0);
    default:
      return 0;
  }
}

export function ScoreBreakdownCard({ entry, rules }: Props) {
  const breakdown = rules.map((r) => {
    const raw = rawValueFor(entry, r.metric_code as MetricCode);
    const points = raw * Number(r.points_per_unit) * Number(r.weight);
    return { ...r, raw, points };
  });
  const totalPoints = breakdown.reduce((s, b) => s + b.points, 0) || 1;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          Composição do score
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Score = Σ (valor × pontos/unidade × peso)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {breakdown.map((b) => {
          const meta = METRIC_LABELS[b.metric_code as MetricCode];
          const pct = (b.points / totalPoints) * 100;
          return (
            <div key={b.metric_code} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span>{meta.icon}</span>
                  <span className="font-medium">{meta.label}</span>
                </span>
                <span className="font-mono text-muted-foreground">
                  {b.points.toFixed(0)} pts
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="pt-2 border-t border-border/50 flex justify-between items-center">
          <span className="text-xs font-semibold">Total</span>
          <span className="font-display font-bold text-primary">
            {totalPoints.toFixed(0)} pts
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
