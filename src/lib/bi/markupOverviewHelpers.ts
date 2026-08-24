import { summarizeMarkup, type MarkupSummary, formatMarkupPct } from '@/lib/markupHelpers';
import { buildCsv } from '@/lib/csv';

/** Linha bruta vinda da view `sales_with_markup`. */
export interface MarkupSaleRow {
  salesperson_id: string | null;
  markup_pct: number | null;
}

export interface MarkupSellerRow {
  salespersonId: string;
  name: string;
  average: number | null;
  criticalCount: number;
  total: number;
}

export interface MarkupOverview {
  summary: MarkupSummary;
  sellers: MarkupSellerRow[];
}

/** Limite de markup considerado crítico (espelha classifyMarkup). */
export const CRITICAL_MARKUP_THRESHOLD = 20;

/**
 * Agrega vendas por vendedor calculando markup médio e nº de vendas críticas.
 * Vendas sem `salesperson_id` são ignoradas no ranking, mas contam no resumo geral.
 */
export function aggregateMarkupOverview(
  rows: ReadonlyArray<MarkupSaleRow>,
  nameById: ReadonlyMap<string, string>,
): MarkupOverview {
  const summary = summarizeMarkup(rows.map((r) => r.markup_pct));

  const values = new Map<string, number[]>();
  const totals = new Map<string, number>();
  const criticals = new Map<string, number>();

  for (const row of rows) {
    const id = row.salesperson_id;
    if (!id) continue;
    totals.set(id, (totals.get(id) ?? 0) + 1);
    const pct = row.markup_pct;
    if (typeof pct === 'number' && !Number.isNaN(pct)) {
      const list = values.get(id) ?? [];
      list.push(pct);
      values.set(id, list);
      if (pct < CRITICAL_MARKUP_THRESHOLD) {
        criticals.set(id, (criticals.get(id) ?? 0) + 1);
      }
    }
  }

  const sellers: MarkupSellerRow[] = [...totals.entries()]
    .map(([id, total]) => {
      const list = values.get(id) ?? [];
      const average =
        list.length > 0
          ? Math.round((list.reduce((a, b) => a + b, 0) / list.length) * 100) / 100
          : null;
      return {
        salespersonId: id,
        name: nameById.get(id) ?? 'Sem vendedor',
        average,
        criticalCount: criticals.get(id) ?? 0,
        total,
      };
    })
    .sort((a, b) => {
      const av = a.average ?? -Infinity;
      const bv = b.average ?? -Infinity;
      if (av !== bv) return bv - av;
      return a.name.localeCompare(b.name, 'pt-BR');
    });

  return { summary, sellers };
}

/** CSV de rentabilidade por vendedor (pt-BR, ';', BOM). */
export function buildMarkupSellersCsv(sellers: ReadonlyArray<MarkupSellerRow>): string {
  return buildCsv([...sellers], [
    { header: 'Vendedor', value: (r) => r.name },
    { header: 'Markup médio', value: (r) => formatMarkupPct(r.average) },
    { header: 'Vendas', value: (r) => r.total },
    { header: 'Vendas críticas (<20%)', value: (r) => r.criticalCount },
  ]);
}
