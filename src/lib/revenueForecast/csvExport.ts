import type { ForecastResult } from "./forecastEngine";

/**
 * Gera CSV com histórico e forecast (bandas P10/P50/P90) da previsão de receita v2.
 * Colunas: period,type,actual,p10,p50,p90
 * - type: "history" | "forecast"
 * - Valores vazios permanecem em branco (não "null") para melhor compatibilidade com Excel.
 */
export function buildRevenueForecastCsv(result: ForecastResult): string {
  const rows: string[] = ["period,type,actual,p10,p50,p90"];
  for (const h of result.history) {
    rows.push(`${escape(h.period)},history,${num(h.revenue)},,,`);
  }
  for (const f of result.forecast) {
    rows.push(
      `${escape(f.period)},forecast,,${num(f.p10)},${num(f.p50)},${num(f.p90)}`,
    );
  }
  return rows.join("\n") + "\n";
}

function escape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function num(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "";
  return n.toFixed(2);
}
