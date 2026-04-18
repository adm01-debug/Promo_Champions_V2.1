import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoachingOpportunities } from "@/hooks/coaching/useCoachingOpportunities";
import { SEVERITY_COLOR, SEVERITY_LABELS } from "./coachingOpportunityHelpers";
import type { CoachingSeverity } from "@/hooks/coaching/useCoachingOpportunities";

const METRIC_KEYS = ["conversion_rate", "stage_duration", "win_rate", "avg_ticket", "activities_per_day"] as const;
const METRIC_SHORT: Record<string, string> = {
  conversion_rate: "Conversão",
  stage_duration: "Duração",
  win_rate: "Win Rate",
  avg_ticket: "Ticket",
  activities_per_day: "Atividades",
};

export const CoachingSeverityHeatmap: FC = () => {
  const { data, isLoading } = useCoachingOpportunities();

  const grid = useMemo(() => {
    const map = new Map<string, { name: string; cells: Record<string, CoachingSeverity | null> }>();
    (data ?? []).forEach((o) => {
      if (!map.has(o.salesperson_id)) {
        map.set(o.salesperson_id, {
          name: o.salesperson_name ?? "—",
          cells: Object.fromEntries(METRIC_KEYS.map((k) => [k, null])) as Record<string, CoachingSeverity | null>,
        });
      }
      map.get(o.salesperson_id)!.cells[o.metric_key] = o.severity;
    });
    return [...map.values()];
  }, [data]);

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Heatmap de severidade</CardTitle>
      </CardHeader>
      <CardContent>
        {grid.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem dados.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium text-muted-foreground">Vendedor</th>
                  {METRIC_KEYS.map((k) => (
                    <th key={k} className="p-2 text-center font-medium text-muted-foreground">
                      {METRIC_SHORT[k]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((row) => (
                  <tr key={row.name}>
                    <td className="p-2 truncate max-w-[140px]">{row.name}</td>
                    {METRIC_KEYS.map((k) => {
                      const sev = row.cells[k];
                      return (
                        <td key={k} className="p-1">
                          <div
                            className="h-6 rounded flex items-center justify-center text-[10px] font-semibold text-background"
                            style={{ background: sev ? SEVERITY_COLOR[sev] : "hsl(var(--muted))", opacity: sev ? 1 : 0.4 }}
                            title={sev ? SEVERITY_LABELS[sev] : "Sem gap"}
                          >
                            {sev ? SEVERITY_LABELS[sev].charAt(0) : "—"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
