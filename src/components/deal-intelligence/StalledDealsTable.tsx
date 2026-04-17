import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { useDealHealthBatch, useRecalculateDealHealth, type HealthTier } from "@/hooks/deal-intelligence/useDealHealth";
import { DealHealthScoreBadge } from "./DealHealthScoreBadge";
import { tierLabel } from "./dealHealthHelpers";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TIER_FILTERS: { value: HealthTier | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "critical", label: "Crítico" },
  { value: "at_risk", label: "Em risco" },
  { value: "watch", label: "Atenção" },
  { value: "healthy", label: "Saudáveis" },
];

export function StalledDealsTable() {
  const [filter, setFilter] = useState<HealthTier | "all">("all");
  const tiers = filter === "all" ? ["critical", "at_risk", "watch"] as HealthTier[] : [filter];
  const { data, isLoading, refetch, isRefetching } = useDealHealthBatch({ tiers });
  const recalc = useRecalculateDealHealth();

  const handleBatchRecalc = async () => {
    await recalc.mutateAsync({ batch: true });
    refetch();
  };

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 shadow-md">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Saúde dos Deals</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBatchRecalc}
              disabled={recalc.isPending || isRefetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${recalc.isPending ? "animate-spin" : ""}`} />
              Recalcular tudo
            </Button>
          </div>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as HealthTier | "all")} className="mt-2">
          <TabsList>
            {TIER_FILTERS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs">{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground glass rounded-lg border border-dashed border-border/40">
            <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-display">Nenhum deal nesta faixa</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {data.map((d: any) => {
              const sale = d.sales;
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-3 rounded-lg glass border border-border/30 hover:border-primary/40 transition-all"
                >
                  <DealHealthScoreBadge score={d.health_score} tier={d.tier} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sale?.client_name || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sale?.product_name} · {tierLabel(d.tier)} · {d.days_in_stage ?? 0}d no estágio
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => recalc.mutate({ saleId: d.sale_id })}
                    disabled={recalc.isPending}
                    className="h-7 w-7 p-0 shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${recalc.isPending ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
