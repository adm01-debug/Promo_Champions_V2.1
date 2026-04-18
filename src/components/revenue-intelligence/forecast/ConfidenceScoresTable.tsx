import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfidenceScores } from "@/hooks/revenue-intelligence/useForecastAccuracy";
import { biasColor, biasLabel, formatMape, sourceLabel } from "./forecastHelpers";

export const ConfidenceScoresTable: FC = () => {
  const { data, isLoading } = useConfidenceScores();

  if (isLoading) return <Skeleton className="h-72" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Confiabilidade por Origem</CardTitle>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Nenhum score de confiança computado.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Períodos</TableHead>
                <TableHead className="text-right">MAPE médio</TableHead>
                <TableHead>Viés</TableHead>
                <TableHead className="w-[180px]">Confiança</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {sourceLabel[s.source] ?? s.source}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.owner_id ? s.owner_id.slice(0, 8) : "Geral"}
                  </TableCell>
                  <TableCell className="text-right">{s.period_count}</TableCell>
                  <TableCell className="text-right">
                    {formatMape(Number(s.avg_mape))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={biasColor[s.bias_trend]}>
                      {biasLabel[s.bias_trend]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={Number(s.confidence_score)} className="h-2" />
                      <span className="text-xs w-10 text-right">
                        {Number(s.confidence_score).toFixed(0)}
                      </span>
                    </div>
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
