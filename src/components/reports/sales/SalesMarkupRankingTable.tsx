import { FC, memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { classifyMarkup, formatMarkupPct } from "@/lib/markupHelpers";
import { useMarkupMinSamplePreference } from "@/hooks/reports/useMarkupMinSamplePreference";
import type { MarkupRankingRow } from "@/hooks/reports/salesReportHelpers";

interface Props {
  data: MarkupRankingRow[];
}

const currency = (v: number): string =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Ranking de rentabilidade (markup médio) por vendedor.
 * Base: apenas vendas ganhas com custo conhecido — vendedores sem custo não aparecem.
 * A amostra mínima escolhida é persistida entre sessões.
 */
export const SalesMarkupRankingTable: FC<Props> = memo(({ data }) => {
  const { minSample, setMinSample, options } = useMarkupMinSamplePreference();

  const rows = useMemo(
    () => data.filter(r => r.sample >= minSample),
    [data, minSample]
  );


  const hiddenCount = data.length - rows.length;

  return (
    <Card className="p-5" data-report-chart="markup-ranking">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" aria-hidden />
          <div>
            <h2 className="text-section-title">Ranking de rentabilidade</h2>
            <p className="text-caption">
              Markup médio por vendedor (vendas ganhas com custo conhecido)
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-1 rounded-lg bg-background/60 p-1"
          role="group"
          aria-label="Amostra mínima de vendas"
        >
          <span className="px-2 text-caption">Amostra mín.</span>
          {MIN_SAMPLE_OPTIONS.map(opt => (
            <Button
              key={opt}
              type="button"
              size="sm"
              variant="ghost"
              aria-pressed={minSample === opt}
              onClick={() => setMinSample(opt)}
              className={cn(
                "h-8 px-3",
                minSample === opt && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-caption py-8 text-center">
          {data.length === 0
            ? "Nenhuma venda com custo conhecido no período selecionado."
            : `Nenhum vendedor com pelo menos ${minSample} venda(s) com custo conhecido.`}
        </p>
      ) : (
        <>
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
                {rows.map((row, i) => {
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
                      <td className="py-2 text-right text-muted-foreground">
                        {currency(row.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hiddenCount > 0 && (
            <p className="text-caption mt-3">
              {hiddenCount} vendedor(es) oculto(s) por amostra menor que {minSample}.
            </p>
          )}
        </>
      )}
    </Card>
  );
});

SalesMarkupRankingTable.displayName = "SalesMarkupRankingTable";
