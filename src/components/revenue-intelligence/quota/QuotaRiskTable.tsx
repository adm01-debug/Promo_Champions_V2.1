import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { QuotaPrediction } from "@/hooks/revenue/useQuotaAttainment";
import { RISK_BADGE, RISK_LABEL, formatCurrency, formatPace, formatPct } from "./quotaPredictorHelpers";

interface Props {
  predictions: QuotaPrediction[];
}

export const QuotaRiskTable: FC<Props> = ({ predictions }) => {
  const sorted = [...predictions].sort((a, b) => a.attainment_probability - b.attainment_probability);

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Risco por vendedor</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Closed</TableHead>
                <TableHead className="text-right">Pipeline ponderado</TableHead>
                <TableHead className="text-right">Prob. quota</TableHead>
                <TableHead className="text-right">Ritmo atual</TableHead>
                <TableHead className="text-right">Ritmo necessário</TableHead>
                <TableHead>Risco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                    Sem predições. Clique em "Recalcular predições" acima.
                  </TableCell>
                </TableRow>
              )}
              {sorted.map((p) => {
                const paceGap = p.current_pace_per_day - p.pace_required_per_day;
                const PaceIcon = paceGap >= 0 ? ArrowUp : ArrowDown;
                const paceColor = paceGap >= 0 ? "text-success" : "text-destructive";
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.salesperson?.name ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(p.closed_amount)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(p.weighted_pipeline)}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{formatPct(p.attainment_probability)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPace(p.current_pace_per_day)}</TableCell>
                    <TableCell className={`text-right tabular-nums ${paceColor}`}>
                      <span className="inline-flex items-center gap-1">
                        <PaceIcon className="h-3 w-3" />
                        {formatPace(p.pace_required_per_day)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={RISK_BADGE[p.risk_level]}>{RISK_LABEL[p.risk_level]}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
