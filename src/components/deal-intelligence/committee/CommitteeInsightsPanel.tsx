import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, DollarSign, UserX, Gauge, AlertTriangle } from "lucide-react";
import { useCommitteeInsights } from "@/hooks/deal-intelligence/useCommitteeCoverage";
import { dmuRoleLabel, type DMURole } from "../committeeHelpers";

function KpiCard({ icon: Icon, label, value, hint, tone = "default" }: {
  icon: typeof Crown; label: string; value: string; hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneCls =
    tone === "good" ? "text-emerald-500" :
    tone === "warn" ? "text-amber-500" :
    tone === "bad" ? "text-destructive" : "text-primary";
  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${toneCls}`} />
      </div>
      <div className={`mt-2 text-2xl font-bold ${toneCls}`}>{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function CommitteeInsightsPanel() {
  const { data, isLoading } = useCommitteeInsights();

  if (isLoading) {
    return (
      <Card variant="modern">
        <CardHeader><CardTitle className="text-base">Insights do Comitê</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.total === 0) {
    return (
      <Card variant="modern">
        <CardHeader><CardTitle className="text-base">Insights do Comitê</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sem dados de cobertura ainda. Execute "Mapear comitê" em uma call ou recalcule cobertura num deal.
          </p>
        </CardContent>
      </Card>
    );
  }

  const championTone = data.withChampionPct >= 70 ? "good" : data.withChampionPct >= 40 ? "warn" : "bad";
  const ebTone = data.withEconomicBuyerPct >= 70 ? "good" : data.withEconomicBuyerPct >= 40 ? "warn" : "bad";
  const stTone = data.singleThreadedCount === 0 ? "good" : data.singleThreadedCount <= 3 ? "warn" : "bad";
  const covTone = data.avgCoverage >= 70 ? "good" : data.avgCoverage >= 40 ? "warn" : "bad";

  return (
    <Card variant="modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4 text-primary" />
          Insights do Comitê
          <span className="ml-auto text-xs font-normal text-muted-foreground">{data.total} deals analisados</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard icon={Crown} label="% com Champion" value={`${data.withChampionPct}%`}
            hint="Deals com champion identificado" tone={championTone} />
          <KpiCard icon={DollarSign} label="% com Comprador Econômico" value={`${data.withEconomicBuyerPct}%`}
            hint="Deals com EB mapeado" tone={ebTone} />
          <KpiCard icon={UserX} label="Single-threaded" value={String(data.singleThreadedCount)}
            hint="Deals com ≤1 stakeholder" tone={stTone} />
          <KpiCard icon={Gauge} label="Cobertura média" value={`${data.avgCoverage}/100`}
            hint="Score médio do portfólio" tone={covTone} />
        </div>
        {data.topGap && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium">Lacuna mais comum:</span>{" "}
              <span className="text-muted-foreground">{dmuRoleLabel(data.topGap as DMURole)}</span>
              <div className="text-xs text-muted-foreground mt-0.5">
                Priorize identificar este papel nos próximos discoveries.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
