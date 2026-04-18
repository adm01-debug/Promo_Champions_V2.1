import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";
import { useCalibrations } from "@/hooks/revenue/useWinProbabilityCalibrator";
import { confidenceLabel, flagBadgeVariant, formatCurrency, formatPct, FLAG_LABEL } from "./calibratorHelpers";

export const OverconfidentDealsTable: FC = () => {
  const { data, isLoading } = useCalibrations({ flag: "overconfident" });

  const rows = useMemo(() => {
    return (data ?? [])
      .slice()
      .sort((a, b) => a.calibration_delta - b.calibration_delta)
      .slice(0, 20);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-destructive" />
          Top Deals Super-Otimistas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhum deal super-otimista detectado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Declarada</TableHead>
                <TableHead className="text-right">Calibrada</TableHead>
                <TableHead className="text-right">Δ</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Flag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{r.sales?.salespeople?.name ?? "—"}</TableCell>
                  <TableCell className="text-xs capitalize">{r.stage}</TableCell>
                  <TableCell className="text-right text-xs">{formatCurrency(r.sales?.amount)}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{formatPct(r.declared_probability, 0)}</TableCell>
                  <TableCell className="text-right text-xs font-medium">{formatPct(r.calibrated_probability, 0)}</TableCell>
                  <TableCell className="text-right text-xs font-semibold text-destructive">
                    {r.calibration_delta.toFixed(1)}pp
                  </TableCell>
                  <TableCell className="text-xs capitalize">{confidenceLabel(r.confidence)}</TableCell>
                  <TableCell>
                    <Badge variant={flagBadgeVariant(r.flag)} className="text-[10px]">
                      {FLAG_LABEL[r.flag]}
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
