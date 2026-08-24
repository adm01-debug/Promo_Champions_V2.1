import "@/styles/winloss-print.css";
import type { WLKpis } from "@/hooks/win-loss/useWinLossAggregations";
import { fmtBRL, fmtDays, fmtPct } from "@/components/deal-intelligence/winloss/winLossHelpers";

interface Props {
  kpis: WLKpis;
  generatedAt?: Date;
}

/**
 * Bloco visível APENAS na impressão (CSS @media print).
 * Renderiza um cabeçalho executivo + KPIs essenciais.
 */
export function WinLossPrintLayout({ kpis, generatedAt = new Date() }: Props) {
  return (
    <div className="print-only print-section">
      <header style={{ borderBottom: "1px solid #000", paddingBottom: 8, marginBottom: 12 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Win/Loss Intelligence — Relatório Executivo</h1>
        <p style={{ fontSize: 11, color: "#555", margin: 0 }}>
          Gerado em {generatedAt.toLocaleString("pt-BR")} · Promo Champions
        </p>
      </header>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <Cell label="Win Rate" value={fmtPct(kpis.winRate)} />
        <Cell label="Forecast 14d" value={fmtPct(kpis.forecastWinRate)} />
        <Cell label="Total analisado" value={String(kpis.total)} />
        <Cell label="Wins" value={String(kpis.wins)} />
        <Cell label="Losses" value={String(kpis.losses)} />
        <Cell label="Ciclo médio (Won)" value={fmtDays(kpis.avgCycleWon)} />
        <Cell label="Ciclo médio (Lost)" value={fmtDays(kpis.avgCycleLost)} />
        <Cell label="Ticket médio (Won)" value={fmtBRL(kpis.avgAmountWon)} />
      </section>
    </div>
  );
}

const Cell = ({ label, value }: { label: string; value: string }) => (
  <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 4 }}>
    <p style={{ fontSize: 10, color: "#666", textTransform: "uppercase", margin: 0 }}>{label}</p>
    <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{value}</p>
  </div>
);
