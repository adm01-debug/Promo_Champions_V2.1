import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, AlertTriangle } from "lucide-react";
import { useCoachingLeaderboard } from "@/hooks/conversational/useCoachingScorecard";
import { useSalespeople } from "@/hooks/sales/useSalespeople";
import { DIMENSION_LABELS, classifyHealth, healthHsl, HEALTH_LABELS, healthBadgeVariant } from "./coachingHelpers";
import type { SalespersonAggregate } from "./coachingHelpers";

const TrendIcon = ({ dir }: { dir: SalespersonAggregate["trend_direction"] }) => {
  if (dir === "up") return <TrendingUp className="h-3 w-3 text-success" />;
  if (dir === "down") return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const Row = ({
  agg,
  name,
  rank,
  variant,
}: {
  agg: SalespersonAggregate;
  name: string;
  rank: number;
  variant: "top" | "bottom";
}) => {
  const health = classifyHealth(agg.avg_overall);
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-background text-xs font-bold tabular-nums">
        {variant === "top" && rank === 1 ? <Crown className="h-3.5 w-3.5 text-warning" /> : `#${rank}`}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{name}</span>
          <TrendIcon dir={agg.trend_direction} />
          {agg.trend_delta !== 0 && (
            <span className={`text-[10px] tabular-nums ${agg.trend_delta > 0 ? "text-success" : "text-destructive"}`}>
              {agg.trend_delta > 0 ? "+" : ""}{agg.trend_delta.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{agg.calls_analyzed} calls</span>
          {agg.top_recurring_gap && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <AlertTriangle className="h-2.5 w-2.5" />
                {DIMENSION_LABELS[agg.top_recurring_gap] ?? agg.top_recurring_gap}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-base font-bold tabular-nums" style={{ color: healthHsl(health) }}>
          {Math.round(agg.avg_overall)}
        </span>
        <Badge variant={healthBadgeVariant(health) as "destructive" | "warning" | "info" | "high"} className="text-[9px] py-0 px-1.5">
          {HEALTH_LABELS[health]}
        </Badge>
      </div>
    </div>
  );
};

export const CoachingLeaderboardPanel = () => {
  const { data, isLoading } = useCoachingLeaderboard(50);
  const { data: salespeople } = useSalespeople();

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    (salespeople ?? []).forEach((s) => m.set(s.id, s.name));
    return m;
  }, [salespeople]);

  const { top, bottom } = useMemo(() => {
    const rows = (data ?? []).filter((a) => a.calls_analyzed > 0);
    return {
      top: rows.slice(0, 5),
      bottom: [...rows].sort((a, b) => a.avg_overall - b.avg_overall).slice(0, 5),
    };
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-72" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Coaching Leaderboard</h3>
        </div>
        <p className="text-xs text-muted-foreground">Nenhum scorecard agregado ainda.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Coaching Leaderboard</h3>
        <span className="text-xs text-muted-foreground ml-auto">últimos 30 dias</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-success font-medium">Top performers</p>
          {top.map((agg, i) => (
            <Row key={agg.id} agg={agg} name={nameById.get(agg.salesperson_id) ?? "—"} rank={i + 1} variant="top" />
          ))}
          {top.length === 0 && <p className="text-xs text-muted-foreground">Sem dados.</p>}
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-warning font-medium">Precisam de coaching</p>
          {bottom.map((agg, i) => (
            <Row key={agg.id} agg={agg} name={nameById.get(agg.salesperson_id) ?? "—"} rank={i + 1} variant="bottom" />
          ))}
          {bottom.length === 0 && <p className="text-xs text-muted-foreground">Sem dados.</p>}
        </div>
      </div>
    </Card>
  );
};
