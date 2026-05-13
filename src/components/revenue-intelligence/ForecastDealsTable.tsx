import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useForecastContributions,
  ForecastCategory,
} from "@/hooks/revenue-intelligence/useRevenueForecast";
import { categoryColor, categoryLabel, formatBRL } from "./forecastHelpers";

interface Props {
  forecastId?: string;
  onSelectSale?: (saleId: string) => void;
}

export const ForecastDealsTable: FC<Props> = ({ forecastId, onSelectSale }) => {
  const [filter, setFilter] = useState<ForecastCategory | "all">("all");
  const { data, isLoading } = useForecastContributions(forecastId);
  const rows = (data ?? []).filter((r) => filter === "all" || r.category === filter);

  return (
    <Card className="glass border-border/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg">Deals do Forecast</CardTitle>
        <ToggleGroup type="single" size="sm" value={filter} onValueChange={(v) => v && setFilter(v as ForecastCategory | "all")}>
          <ToggleGroupItem value="all">Todos</ToggleGroupItem>
          <ToggleGroupItem value="commit">Commit</ToggleGroupItem>
          <ToggleGroupItem value="best">Best</ToggleGroupItem>
          <ToggleGroupItem value="upside">Upside</ToggleGroupItem>
          <ToggleGroupItem value="omitted">Omitido</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhum deal nesta categoria. Gere o forecast para popular dados.
          </p>
        ) : (
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor Ponderado</TableHead>
                  <TableHead className="text-right">Probabilidade</TableHead>
                  <TableHead>Razão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow 
                    key={r.id}
                    className={onSelectSale ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onSelectSale?.(r.sale_id)}
                  >
                    <TableCell>
                      <Badge variant="outline" className={categoryColor[r.category]}>
                        {categoryLabel[r.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(r.weighted_amount)}</TableCell>
                    <TableCell className="text-right">{Math.round(r.probability * 100)}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reasoning}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
