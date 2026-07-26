import { FC, memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { classifyMarkup, formatMarkupPct } from "@/lib/markupHelpers";
import type { MarkupRankingRow } from "@/hooks/reports/salesReportHelpers";

interface Props {
  data: MarkupRankingRow[];
}

const currency = (v: number): string =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Ranking de rentabilidade (markup médio) por vendedor.
 * Base: apenas vendas ganhas com custo conhecido — vendedores sem custo não aparecem.
 */
export const SalesMarkupRankingTable: FC<Props> = memo(({ data }) => {
  return (
    <Card className="p-5" data-report-chart="markup-ranking">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" aria-hidden />
        <div>
          <h2 className="text-section-title">Ranking de rentabilidade</h2>
          <p className="text-caption">Markup médio por vendedor (vendas ganhas com custo conhecido)</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-caption py-8 text-center">
          Nenhuma venda com custo conhecido no período selecionado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">#</th>
                <th className="py-2 pr-3 font-medium">Vendedor</th>
                <th className="py-2 pr-3 font-medium text-right">Markup médio</th>
                <th className="py-2 pr-3 font-medium text-right">Vendas</th>
                <th className="py-2 font-medium text-right">Receita</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const cls = classifyMarkup(row.avgMarkup);
                return (
                  <tr key={row.salespersonId} className="border-b border-border/30 last:border-0">
                    <td className="py-2 pr-3 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-3 font-medium text-foreground">{row.name}</td>
                    <td className="py-2 pr-3 text-right">
                      <Badge variant="outline" className={cls.className}>
                        {formatMarkupPct(row.avgMarkup)}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-right text-muted-foreground">{row.sample}</td>
                    <td className="py-2 text-right text-muted-foreground">{currency(row.revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
});

SalesMarkupRankingTable.displayName = "SalesMarkupRankingTable";
