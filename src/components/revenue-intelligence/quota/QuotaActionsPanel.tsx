import { FC, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useQuotaForecasts, useQuotaActions } from "@/hooks/revenue/useQuotaAttainmentPredictor";
import { ACTION_LABEL, fmtBRL } from "./quotaPredictorAdvancedHelpers";

export const QuotaActionsPanel: FC = () => {
  const { data: forecasts = [] } = useQuotaForecasts();
  const ids = useMemo(() => forecasts.map((f) => f.id), [forecasts]);
  const { data: actions = [], isLoading } = useQuotaActions(ids);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof actions>();
    for (const a of actions) {
      const list = map.get(a.forecast_id) ?? [];
      list.push(a);
      map.set(a.forecast_id, list);
    }
    return forecasts
      .map((f) => ({ forecast: f, items: map.get(f.id) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [actions, forecasts]);

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Recomendações IA por vendedor
          <Badge variant="secondary" className="ml-auto">{actions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando ações…</p>}
        {!isLoading && grouped.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma ação recomendada. Recalcule predições para gerar via IA.
          </p>
        )}
        {grouped.map(({ forecast, items }) => (
          <div key={forecast.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{forecast.salesperson?.name ?? "—"}</p>
              <Badge variant="outline" className="text-[10px]">
                Gap {fmtBRL(Math.max(0, forecast.quota - forecast.p50))}
              </Badge>
            </div>
            <div className="space-y-1.5">
              {items.map((a) => (
                <div key={a.id} className="flex items-start gap-2 rounded-md border border-border/50 bg-card p-2.5">
                  <ArrowUpRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-medium">{a.title}</p>
                      <Badge variant="secondary" className="text-[10px]">{ACTION_LABEL[a.action_type]}</Badge>
                      {a.expected_impact > 0 && (
                        <Badge variant="outline" className="text-[10px]">+{fmtBRL(a.expected_impact)}</Badge>
                      )}
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
