import { memo, useEffect, useMemo, useState } from "react";
import { ChevronDown, FlaskConical } from "lucide-react";
import type { BandMode, ConfidenceLevel } from "@/hooks/win-loss/useWinLossScenarios";

const AUDIT_OPEN_KEY = "winloss-scenario-audit-open";

interface Props {
  slope: number;
  intercept: number;
  stdDev: number;
  sse: number;
  dof: number;
  fitN: number;
  meanX: number;
  sxx: number;
  bandMode: BandMode;
  tCritical: number | null;
  confidenceZ: number;
  bandLabel: string;
  confidenceLevel?: ConfidenceLevel;
  rSquared?: number;
  residuals?: number[];
}

/**
 * Mini-sparkline dos resíduos (y − ŷ) ao longo dos pontos históricos.
 * Linha zero centralizada; barras acima = sub-predição, abaixo = super-predição.
 */
function ResidualsSparkline({ residuals }: { residuals: number[] }) {
  const { bars, width, height, midY, maxAbs } = useMemo(() => {
    const w = Math.max(80, residuals.length * 10);
    const h = 28;
    const max = residuals.reduce((m, r) => Math.max(m, Math.abs(r)), 0) || 1;
    const mid = h / 2;
    const barW = residuals.length > 0 ? (w - 2) / residuals.length : 0;
    const result = residuals.map((r, i) => {
      const norm = r / max;
      const barH = Math.abs(norm) * (mid - 1);
      const x = 1 + i * barW;
      const y = norm >= 0 ? mid - barH : mid;
      return { x, y, w: Math.max(1, barW - 1), h: Math.max(1, barH), positive: norm >= 0 };
    });
    return { bars: result, width: w, height: h, midY: mid, maxAbs: max };
  }, [residuals]);

  if (residuals.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Resíduos do ajuste, ${residuals.length} pontos, máximo absoluto ${maxAbs.toFixed(2)} pp`}
    >
      <line
        x1="0"
        x2={width}
        y1={midY}
        y2={midY}
        className="stroke-border"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          className={b.positive ? "fill-success/70" : "fill-destructive/70"}
        />
      ))}
    </svg>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 border-b border-border/40 last:border-0">
      <span className="text-[11px] text-muted-foreground" title={hint}>
        {label}
      </span>
      <span className="text-xs font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export const ScenarioForecastAuditPanel = memo(function ScenarioForecastAuditPanel({
  slope,
  intercept,
  stdDev,
  sse,
  dof,
  fitN,
  meanX,
  sxx,
  bandMode,
  tCritical,
  confidenceZ,
  bandLabel,
  confidenceLevel = 0.95,
  rSquared,
  residuals = [],
}: Props) {
  const sign = slope >= 0 ? "+" : "−";
  const equation = `ŷ = ${intercept.toFixed(2)} ${sign} ${Math.abs(slope).toFixed(3)}·x`;
  const levelPct = Math.round(confidenceLevel * 100);

  const r2Display = rSquared === undefined || !Number.isFinite(rSquared)
    ? "—"
    : rSquared.toFixed(3);
  const r2Quality = rSquared === undefined
    ? ""
    : rSquared >= 0.7
      ? " (forte)"
      : rSquared >= 0.4
        ? " (moderado)"
        : " (fraco)";
  const maxAbsResidual = residuals.reduce((m, r) => Math.max(m, Math.abs(r)), 0);

  return (
    <details
      className="group border-t border-border/60 px-4 py-2"
      aria-label="Painel de auditoria do ajuste de regressão"
    >
      <summary className="flex items-center gap-2 cursor-pointer list-none select-none text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
        <FlaskConical className="h-3.5 w-3.5" aria-hidden />
        <span>Auditoria do ajuste</span>
        <ChevronDown className="h-3.5 w-3.5 ml-auto transition-transform group-open:rotate-180" aria-hidden />
      </summary>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <div>
          <Row label="Slope (β₁)" value={`${slope.toFixed(3)} pp/período`} hint="Inclinação da reta OLS" />
          <Row label="Intercept (β₀)" value={`${intercept.toFixed(2)} pp`} hint="Valor previsto em x=0" />
          <Row label="Equação" value={equation} hint="ŷ = β₀ + β₁·x" />
          <Row label="fitN" value={`${fitN} períodos`} hint="Pontos históricos usados no ajuste" />
          <Row
            label="R² (coef. determinação)"
            value={`${r2Display}${r2Quality}`}
            hint="1 − SSE/SST · proporção da variância explicada pela reta (1 = perfeito)"
          />
        </div>
        <div>
          <Row label="SSE" value={sse.toFixed(2)} hint="Σ(y − ŷ)² — soma dos quadrados dos resíduos" />
          <Row label="Residual σ (SEE)" value={`${stdDev.toFixed(2)} pp`} hint="√(SSE/dof)" />
          <Row label="Graus de liberdade" value={`n − 2 = ${dof}`} />
          <Row
            label="Modo de banda"
            value={bandMode === "pi95" ? `PI ${levelPct}% (t=${(tCritical ?? 0).toFixed(2)})` : bandLabel}
          />
          {bandMode === "see" && (
            <Row
              label="z (multiplicador SEE)"
              value={confidenceZ.toFixed(3)}
              hint="1.00=68% · 1.28=80% · 1.645=90% · 1.96=95%"
            />
          )}
          <Row label="x̄" value={meanX.toFixed(2)} hint="Centro do x usado no fator de inflação OLS" />
          <Row label="Sxx" value={sxx.toFixed(2)} hint="Σ(x − x̄)²" />
        </div>
      </div>

      {bandMode === "pi95" && fitN >= 3 && (
        <div className="mt-3 pt-2 border-t border-border/40 bg-muted/20 -mx-4 px-4 py-2">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-foreground">
              Fórmula do intervalo PI {levelPct}%
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              gl = {dof}
            </span>
          </div>
          <div className="space-y-1 font-mono text-[11px] tabular-nums text-foreground/90 leading-relaxed">
            <div title="Forma simbólica do prediction interval OLS">
              <span className="text-muted-foreground">width(x) =</span>{" "}
              <span className="px-1 rounded bg-primary/10 text-primary font-semibold">t</span>
              {" · "}
              <span className="px-1 rounded bg-warning/10 text-warning font-semibold">σ</span>
              {" · √(1 + 1/"}
              <span className="px-1 rounded bg-accent/15 text-accent-foreground font-semibold">n</span>
              {" + (x − "}
              <span className="px-1 rounded bg-success/10 text-success font-semibold">x̄</span>
              {")² / "}
              <span className="px-1 rounded bg-destructive/10 text-destructive font-semibold">Sxx</span>
              {")"}
            </div>
            <div title="Substituindo os parâmetros do ajuste atual">
              <span className="text-muted-foreground">=</span>{" "}
              <span className="px-1 rounded bg-primary/10 text-primary font-semibold">{(tCritical ?? 0).toFixed(3)}</span>
              {" · "}
              <span className="px-1 rounded bg-warning/10 text-warning font-semibold">{stdDev.toFixed(2)}</span>
              {" · √(1 + 1/"}
              <span className="px-1 rounded bg-accent/15 text-accent-foreground font-semibold">{fitN}</span>
              {" + (x − "}
              <span className="px-1 rounded bg-success/10 text-success font-semibold">{meanX.toFixed(2)}</span>
              {")² / "}
              <span className="px-1 rounded bg-destructive/10 text-destructive font-semibold">{sxx.toFixed(2)}</span>
              {")"}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            <span><span className="inline-block w-2 h-2 rounded-sm bg-primary/60 mr-1 align-middle" />t — multiplicador do nível</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-warning/60 mr-1 align-middle" />σ — SEE residual</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-accent mr-1 align-middle" />n — pontos do ajuste</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-success/60 mr-1 align-middle" />x̄ — centro do x</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-destructive/60 mr-1 align-middle" />Sxx — Σ(x − x̄)²</span>
          </div>
        </div>
      )}

      {residuals.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border/40">
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-[11px] text-muted-foreground" title="Resíduo = valor observado − valor predito (y − ŷ)">
              Resíduos por período
            </span>
            <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
              máx |r| = {maxAbsResidual.toFixed(2)} pp
            </span>
          </div>
          <ResidualsSparkline residuals={residuals} />
          <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">
            <span className="text-success">▲</span> sub-predição (y &gt; ŷ) ·{" "}
            <span className="text-destructive">▼</span> super-predição (y &lt; ŷ). Padrão aleatório em torno de zero = ajuste saudável.
          </p>
        </div>
      )}

      <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
        σ menor = ajuste mais aderente · R² alto = reta explica bem · |slope| baixo = sem tendência clara.
      </p>
    </details>
  );
});
