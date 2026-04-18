import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingDown, Clock, Target, RefreshCw, Sparkles } from "lucide-react";
import { useWinLossSummary, useAnalyzeWinLoss, useMinePatterns } from "@/hooks/deal-intelligence/useWinLoss";
import { fmtPct, fmtDays, fmtBRL } from "./winLossHelpers";
import { Skeleton } from "@/components/ui/skeleton";

export function WinLossSummaryCard() {
  const { data, isLoading } = useWinLossSummary();
  const analyze = useAnalyzeWinLoss();
  const mine = useMinePatterns();

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Win/Loss Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Carregando…" : `${data?.totalAnalyzed ?? 0} deals analisados`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => analyze.mutate()} disabled={analyze.isPending}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${analyze.isPending ? "animate-spin" : ""}`} />
            Analisar
          </Button>
          <Button size="sm" onClick={() => mine.mutate()} disabled={mine.isPending}>
            <Sparkles className={`h-4 w-4 mr-1.5 ${mine.isPending ? "animate-pulse" : ""}`} />
            Minerar IA
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi icon={<Trophy className="h-4 w-4 text-emerald-500" />} label="Win Rate" value={fmtPct(data?.winRate)} />
            <Kpi icon={<Clock className="h-4 w-4 text-blue-500" />} label="Ciclo Won" value={fmtDays(data?.avgCycleWon)} sub={`Lost: ${fmtDays(data?.avgCycleLost)}`} />
            <Kpi icon={<Target className="h-4 w-4 text-amber-500" />} label="Top Win" value={data?.topWinReason ?? "—"} />
            <Kpi icon={<TrendingDown className="h-4 w-4 text-rose-500" />} label="Top Loss" value={data?.topLossReason ?? "—"} sub={`Concorrente: ${data?.topCompetitor ?? "—"}`} />
          </div>
        )}
        {data?.avgAmountWon ? (
          <p className="text-xs text-muted-foreground mt-3">Ticket médio Won: {fmtBRL(data.avgAmountWon)}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Kpi({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/50 p-3 bg-card">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="text-xl font-semibold mt-1 truncate" title={value}>{value}</div>
      {sub ? <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div> : null}
    </div>
  );
}
