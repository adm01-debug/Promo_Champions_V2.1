import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Sparkles } from "lucide-react";
import { useCoachingOpportunities, type CoachingOpportunity } from "@/hooks/coaching/useCoachingOpportunities";
import { SEVERITY_BADGE, SEVERITY_LABELS, SKILL_LABELS } from "./coachingOpportunityHelpers";

export const CoachingActionsPanel: FC = () => {
  const { data, isLoading } = useCoachingOpportunities();

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; rows: CoachingOpportunity[] }>();
    (data ?? []).forEach((o) => {
      const key = o.salesperson_id;
      if (!map.has(key)) map.set(key, { name: o.salesperson_name ?? "—", rows: [] });
      map.get(key)!.rows.push(o);
    });
    map.forEach((g) => g.rows.sort((a, b) => a.priority - b.priority));
    return [...map.values()].sort(
      (a, b) =>
        b.rows.filter((r) => r.severity === "critical").length - a.rows.filter((r) => r.severity === "critical").length,
    );
  }, [data]);

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Ações recomendadas pela IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhuma ação disponível.</p>
        ) : (
          grouped.slice(0, 12).map((g) => (
            <div key={g.name} className="space-y-2">
              <p className="text-sm font-semibold">{g.name}</p>
              <ul className="space-y-1.5">
                {g.rows.map((r) => (
                  <li key={r.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/40 border border-border/40">
                    <Lightbulb className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={SEVERITY_BADGE[r.severity]} className="text-[10px]">
                          {SEVERITY_LABELS[r.severity]}
                        </Badge>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {SKILL_LABELS[r.skill_focus]}
                        </span>
                      </div>
                      <p className="text-sm leading-snug">{r.recommended_action ?? "—"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
