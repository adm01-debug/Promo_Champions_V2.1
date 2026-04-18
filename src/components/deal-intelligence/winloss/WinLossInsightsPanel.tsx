import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { useWinLossInsights } from "@/hooks/deal-intelligence/useWinLoss";
import { severityClasses, severityLabel, insightTypeLabel, type Severity } from "./winLossHelpers";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function WinLossInsightsPanel() {
  const { data, isLoading } = useWinLossInsights();
  const insights = data ?? [];

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-primary" />
          Insights Acionáveis (IA)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : insights.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Sem insights. Clique em "Minerar IA" no card acima para gerar recomendações.
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map(i => {
              const sev = (i.severity ?? "info") as Severity;
              const evidence = i.evidence as { sample_size?: number } | undefined;
              return (
                <div key={i.id} className="rounded-lg border border-border/50 p-3 bg-card">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-medium text-sm">{i.title}</h4>
                    <div className="flex gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {insightTypeLabel[i.insight_type] ?? i.insight_type}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${severityClasses[sev]}`}>
                        {severityLabel[sev]}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{i.description}</p>
                  {evidence?.sample_size ? (
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Baseado em {evidence.sample_size} deals analisados
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
