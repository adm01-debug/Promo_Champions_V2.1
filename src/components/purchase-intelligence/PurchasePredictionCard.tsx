import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, AlertTriangle, Clock, Sparkles } from "lucide-react";
import { usePurchaseIntelligence } from "@/hooks/purchase-intelligence/usePurchaseIntelligence";
import {
  CONTACT_WINDOW_LABELS,
  formatBRL,
  formatDatePt,
  riskColor,
  riskLabel,
} from "./purchaseIntelligenceHelpers";

interface Props {
  clientId?: string;
}

export function PurchasePredictionCard({ clientId }: Props) {
  const { data, isLoading, isFetching } = usePurchaseIntelligence(clientId, true);

  if (!clientId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Selecione um cliente para ver a análise preditiva.
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <Skeleton className="h-80 rounded-xl" />;
  if (!data) return null;

  const ai = data.ai_prediction;
  const risk = ai?.churn_risk_score ?? 0;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-4 w-4 text-primary" />
          Análise Preditiva 360°
          {isFetching && <Sparkles className="h-3 w-3 animate-pulse text-primary" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total compras" value={String(data.total_purchases)} />
          <Stat label="Receita total" value={formatBRL(data.total_revenue)} />
          <Stat label="Ticket médio" value={formatBRL(data.avg_ticket)} />
          <Stat label="Ciclo médio" value={`${data.avg_cycle_days ?? 0} dias`} />
        </div>

        {/* Share */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Minha fatia</span>
            <span className="font-semibold text-primary">{data.share_with_me_pct.toFixed(0)}%</span>
          </div>
          <Progress value={data.share_with_me_pct} className="h-2" />
          {data.top_competitor_internal && data.share_with_others_pct > 0 && (
            <p className="text-xs text-muted-foreground">
              Principal concorrente interno:{" "}
              <strong className="text-warning">
                {data.top_competitor_internal.salesperson_name ?? "Desconhecido"}
              </strong>{" "}
              ({formatBRL(data.top_competitor_internal.revenue)})
            </p>
          )}
        </div>

        {/* AI prediction */}
        {ai ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3" /> Próxima compra prevista
                </div>
                <div className="text-lg font-bold">{formatDatePt(ai.predicted_next_purchase_date)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatBRL(ai.predicted_amount)} · confiança {(ai.confidence * 100).toFixed(0)}%
                </div>
              </div>

              <div className="rounded-lg border border-border/60 p-3" style={{ borderColor: riskColor(risk) }}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <AlertTriangle className="h-3 w-3" /> Risco de churn
                </div>
                <div className="text-lg font-bold" style={{ color: riskColor(risk) }}>
                  {risk}/100 · {riskLabel(risk)}
                </div>
                {ai.risk_reasons.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {ai.risk_reasons.slice(0, 2).join(" · ")}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Janela ideal:</span>
                <Badge variant="secondary">{CONTACT_WINDOW_LABELS[ai.best_contact_window]}</Badge>
              </div>
              <p className="text-sm leading-relaxed">
                <Sparkles className="inline h-3 w-3 text-primary mr-1" />
                {ai.pattern_insight}
              </p>
              <p className="text-sm font-medium border-l-2 border-primary pl-3">
                {ai.recommended_action}
              </p>
            </div>
          </div>
        ) : data.ai_error ? (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            {data.ai_error === "rate_limited"
              ? "Limite de IA atingido — tente novamente em instantes."
              : data.ai_error === "credits_required"
              ? "Adicione créditos no workspace para análise preditiva por IA."
              : "Análise IA indisponível no momento."}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Próxima compra estimada (cadência): <strong>{formatDatePt(data.predicted_next_purchase_date)}</strong>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold mt-0.5">{value}</div>
    </div>
  );
}
