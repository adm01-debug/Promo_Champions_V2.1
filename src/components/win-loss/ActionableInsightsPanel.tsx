import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, CheckCircle2, Sparkles as NewIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWinLossInsights } from "@/hooks/deal-intelligence/useWinLoss";
import { severityClasses, severityLabel, insightTypeLabel, type Severity } from "@/components/deal-intelligence/winloss/winLossHelpers";
import { InsightPinCard } from "./InsightPinCard";

const NEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

type SeverityFilter = "all" | Severity;

interface Props {
  onCopilot?: (insight: { id: string; title: string; description: string }) => void;
}

export function ActionableInsightsPanel({ onCopilot }: Props = {}) {
  const { data, isLoading } = useWinLossInsights();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const all = data ?? [];
  const insights = all.filter(i => filter === "all" || i.severity === filter);

  const apply = async (id: string) => {
    const { error } = await supabase
      .from("win_loss_insights")
      .update({ applied_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao aplicar insight");
      return;
    }
    toast.success("Insight marcado como aplicado");
    qc.invalidateQueries({ queryKey: ["win-loss-insights"] });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-primary" />
          Insights Acionáveis (IA)
        </CardTitle>
        <div className="flex gap-1">
          {(["all", "opportunity", "risk", "info"] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "ghost"}
              className="h-6 px-2 text-[11px]"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todos" : severityLabel[f]}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-20" />)}</div>
        ) : !insights.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sem insights nessa categoria.</p>
        ) : (
          <div className="space-y-3">
            {insights.map(i => {
              const sev = (i.severity ?? "info") as Severity;
              const evidence = i.evidence as { sample_size?: number } | undefined;
              const isNew = Date.now() - new Date(i.created_at).getTime() < NEW_THRESHOLD_MS;
              const applied = (i as unknown as { applied_at?: string | null }).applied_at;
              return (
                <div key={i.id} className="rounded-lg border border-border/50 p-3 bg-card">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">{i.title}</h4>
                      {isNew && !applied && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700">
                          <NewIcon className="h-2.5 w-2.5 mr-1" /> novo
                        </Badge>
                      )}
                      {applied && (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> aplicado
                        </Badge>
                      )}
                    </div>
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
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-muted-foreground">
                      {evidence?.sample_size ? `Baseado em ${evidence.sample_size} deals` : ""}
                    </p>
                    {!applied && (
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => apply(i.id)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Marcar aplicado
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
