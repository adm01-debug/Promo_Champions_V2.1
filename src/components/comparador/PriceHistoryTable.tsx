import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, TrendingDown, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PriceHistoryTableProps {
  priceHistory: any[];
  formatCurrency: (value: number) => string;
}

export const PriceHistoryTable = React.memo(function PriceHistoryTable({
  priceHistory,
  formatCurrency,
}: PriceHistoryTableProps) {
  if (!priceHistory || priceHistory.length === 0) return null;

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico Recente de Preços
        </CardTitle>
        <CardDescription>Últimas alterações de preço dos fornecedores</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Preço Anterior</TableHead>
              <TableHead className="text-right">Novo Preço</TableHead>
              <TableHead className="text-center">Variação</TableHead>
              <TableHead className="text-center">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priceHistory.slice(0, 10).map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.products?.name}</TableCell>
                <TableCell>{record.suppliers?.name}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(record.old_price)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(record.new_price)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={record.price_change_percent < 0 ? "default" : "destructive"}>
                    {record.price_change_percent < 0 ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    )}
                    {record.price_change_percent.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(record.recorded_at), { addSuffix: true, locale: ptBR })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});
