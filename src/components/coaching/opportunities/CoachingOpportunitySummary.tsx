import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Users, Target, TrendingDown, RefreshCw } from "lucide-react";
import { useCoachingSummary, useDetectCoachingOpportunities } from "@/hooks/coaching/useCoachingOpportunities";
import { SKILL_LABELS } from "./coachingOpportunityHelpers";
import type { CoachingSkillFocus } from "@/hooks/coaching/useCoachingOpportunities";

export const CoachingOpportunitySummary: FC = () => {
  const { data, isLoading } = useCoachingSummary();
  const detect = useDetectCoachingOpportunities();

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  const cards = [
    { label: "Críticas", value: data?.critical_count ?? 0, icon: AlertTriangle, color: "text-destructive" },
    { label: "Vendedores afetados", value: data?.reps_affected ?? 0, icon: Users, color: "text-warning" },
    {
      label: "Skill mais frequente",
      value: data?.top_skill ? SKILL_LABELS[data.top_skill as CoachingSkillFocus] ?? data.top_skill : "—",
      icon: Target,
      color: "text-info",
    },
    { label: "Gap médio", value: data?.avg_gap_pct ? `${data.avg_gap_pct.toFixed(0)}%` : "—", icon: TrendingDown, color: "text-primary" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Visão geral</h3>
        <Button size="sm" variant="outline" onClick={() => detect.mutate()} disabled={detect.isPending} className="gap-2">
          <RefreshCw className={`h-3.5 w-3.5 ${detect.isPending ? "animate-spin" : ""}`} />
          {detect.isPending ? "Analisando..." : "Detectar oportunidades"}
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`p-2 rounded-md bg-muted/40 ${c.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-xl font-semibold truncate">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
