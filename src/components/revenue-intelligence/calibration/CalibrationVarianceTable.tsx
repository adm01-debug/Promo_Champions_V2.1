import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WinCalibrationRow } from "@/hooks/revenue/useWinProbabilityCalibration";
import { colorByDelta, confidenceBadgeVariant, confidenceLabel, formatPercent } from "./calibrationHelpers";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  data: WinCalibrationRow[];
}

export const CalibrationVarianceTable: FC<Props> = ({ data }) => {
  const top = useMemo(() => {
    return [...data]
      .filter((d) => d.sample_size > 0)
      .map((d) => ({ ...d, delta: d.calibrated_probability - d.baseline_probability }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 10);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Maiores Divergências Baseline → Calibrado</CardTitle>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Sem divergências significativas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escopo</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead className="text-right">Baseline</TableHead>
                <TableHead className="text-right">Calibrado</TableHead>
                <TableHead className="text-right">Δ</TableHead>
                <TableHead className="text-right">Amostra</TableHead>
                <TableHead>Confiança</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs">
                    <span className="font-medium capitalize">{row.scope}</span>
                    {row.scope_value && <span className="text-muted-foreground"> · {row.scope_value.slice(0, 8)}</span>}
                  </TableCell>
                  <TableCell className="capitalize text-xs">{row.stage}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{formatPercent(row.baseline_probability, 0)}</TableCell>
                  <TableCell className="text-right text-xs font-medium">{formatPercent(row.calibrated_probability, 1)}</TableCell>
                  <TableCell className={`text-right text-xs font-semibold inline-flex items-center justify-end gap-1 w-full ${colorByDelta(row.delta)}`}>
                    {row.delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {row.delta >= 0 ? "+" : ""}{row.delta.toFixed(1)}pp
                  </TableCell>
                  <TableCell className="text-right text-xs">{row.sample_size}</TableCell>
                  <TableCell>
                    <Badge variant={confidenceBadgeVariant(row.confidence)} className="text-[10px]">
                      {confidenceLabel(row.confidence)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
