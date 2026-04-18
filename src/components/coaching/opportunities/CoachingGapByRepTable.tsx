import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCoachingOpportunities, type CoachingOpportunity } from "@/hooks/coaching/useCoachingOpportunities";
import { SEVERITY_BADGE, SEVERITY_LABELS, SKILL_LABELS, formatMetricValue, formatGap } from "./coachingOpportunityHelpers";

export const CoachingGapByRepTable: FC = () => {
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

  if (grouped.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma oportunidade detectada ainda. Clique em "Detectar oportunidades" para iniciar.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 3 gaps por vendedor</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Métrica</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead className="text-right">Atual</TableHead>
                <TableHead className="text-right">Equipe</TableHead>
                <TableHead className="text-right">Gap</TableHead>
                <TableHead>Severidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.flatMap((g) =>
                g.rows.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{i === 0 ? g.name : ""}</TableCell>
                    <TableCell className="text-sm">{r.metric_label}</TableCell>
                    <TableCell className="text-xs">{SKILL_LABELS[r.skill_focus]}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMetricValue(r.metric_key, Number(r.current_value))}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatMetricValue(r.metric_key, Number(r.team_benchmark))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{formatGap(Number(r.gap_pct))}</TableCell>
                    <TableCell>
                      <Badge variant={SEVERITY_BADGE[r.severity]}>{SEVERITY_LABELS[r.severity]}</Badge>
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
