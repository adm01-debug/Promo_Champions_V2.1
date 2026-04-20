import { useCallback } from "react";
import { toast } from "sonner";
import type { WLKpis } from "./useWinLossAggregations";
import type { CompetitorStat } from "./useWinLossAggregations";
import type { KpiDelta } from "./usePreviousPeriodKpis";

interface InsightLite {
  title: string;
  description: string | null;
  severity: string | null;
}

const fmtPct = (n: number): string => `${n.toFixed(1)}%`;
const fmtDelta = (d: number | undefined): string => {
  if (d == null) return "";
  const sign = d > 0 ? "▲" : d < 0 ? "▼" : "·";
  return ` (${sign} ${Math.abs(d).toFixed(1)}%)`;
};

export const useWinLossDigest = (
  kpis: WLKpis,
  delta: KpiDelta | undefined,
  insights: InsightLite[],
  competitors: CompetitorStat[],
) => {
  return useCallback(async () => {
    const top3Insights = insights.slice(0, 3);
    const top3Comp = competitors.slice(0, 3);

    const md = [
      `# 📊 Win/Loss — Resumo Executivo`,
      `> Gerado em ${new Date().toLocaleString("pt-BR")}`,
      ``,
      `## KPIs principais`,
      `- **Win Rate:** ${fmtPct(kpis.winRate)}${fmtDelta(delta?.winRate)}`,
      `- **Total analisado:** ${kpis.total}${fmtDelta(delta?.total)}`,
      `- **Wins:** ${kpis.wins} · **Losses:** ${kpis.losses}`,
      `- **Ciclo médio (Won):** ${kpis.avgCycleWon.toFixed(1)}d${fmtDelta(delta?.avgCycleWon)}`,
      `- **Ticket médio (Won):** R$ ${kpis.avgAmountWon.toFixed(2)}`,
      `- **Forecast 14d:** ${fmtPct(kpis.forecastWinRate)}`,
      ``,
      `## 🎯 Top 3 Insights`,
      ...(top3Insights.length
        ? top3Insights.map((i, idx) => `${idx + 1}. **${i.title}** — ${i.description ?? "—"} _(severidade: ${i.severity ?? "info"})_`)
        : ["_Nenhum insight disponível._"]),
      ``,
      `## 🥊 Top 3 Concorrentes`,
      ...(top3Comp.length
        ? top3Comp.map((c, idx) => `${idx + 1}. **${c.name}** — ${c.encounters} encontros · ${fmtPct(c.winRateVs)} de win rate vs.`)
        : ["_Nenhum concorrente registrado._"]),
      ``,
      `## 💡 Recomendação`,
      delta?.winRate != null && delta.winRate < -5
        ? `Win rate caiu ${Math.abs(delta.winRate).toFixed(1)}% vs. período anterior — investigar padrão.`
        : delta?.winRate != null && delta.winRate > 5
          ? `Win rate subiu ${delta.winRate.toFixed(1)}% — replicar boas práticas.`
          : `Indicadores estáveis — manter cadência atual.`,
      ``,
      `_— Promo Champions Win/Loss Intelligence_`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(md);
      toast.success("Resumo executivo copiado!", { description: "Cole em e-mail, Slack ou doc." });
    } catch {
      toast.error("Não foi possível copiar — verifique permissões do navegador.");
    }
  }, [kpis, delta, insights, competitors]);
};
