import { memo } from "react";
import { ChevronDown, FlaskConical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { BandMode } from "@/hooks/win-loss/useWinLossScenarios";

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
  seeUseOlsInflation: boolean;
  onToggleSeeOlsInflation: (value: boolean) => void;
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
  seeUseOlsInflation,
  onToggleSeeOlsInflation,
}: Props) {
  const sign = slope >= 0 ? "+" : "−";
  const equation = `ŷ = ${intercept.toFixed(2)} ${sign} ${Math.abs(slope).toFixed(3)}·x`;
  const showOlsRows = bandMode === "pi95" || (bandMode === "see" && seeUseOlsInflation);
  const seeModeLabel = seeUseOlsInflation ? "SEE 1σ (PI)" : "SEE ±σ · √(1+step/n)";
  const toggleId = "see-ols-inflation-toggle";

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
        </div>
        <div>
          <Row label="SSE" value={sse.toFixed(2)} hint="Σ(y − ŷ)² — soma dos quadrados dos resíduos" />
          <Row label="Residual σ (SEE)" value={`${stdDev.toFixed(2)} pp`} hint="√(SSE/dof)" />
          <Row label="Graus de liberdade" value={`n − 2 = ${dof}`} />
          <Row
            label="Modo de banda"
            value={bandMode === "pi95" ? `PI 95% (t=${(tCritical ?? 0).toFixed(2)})` : seeModeLabel}
          />
          {showOlsRows && (
            <>
              <Row label="x̄" value={meanX.toFixed(2)} hint="Centro do x usado no fator de inflação OLS" />
              <Row label="Sxx" value={sxx.toFixed(2)} hint="Σ(x − x̄)²" />
            </>
          )}
        </div>
      </div>

      {bandMode === "see" && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
          <div className="min-w-0">
            <Label
              htmlFor={toggleId}
              className="text-[11px] font-medium text-foreground cursor-pointer"
            >
              Usar aproximação legada √(1 + step/n)
            </Label>
            <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug font-mono">
              {seeUseOlsInflation
                ? "padrão: width = σ · √(1 + 1/n + (x − x̄)² / Sxx)  (PI 1σ)"
                : "legado: width = σ · √(1 + step/n)  (não usa Sxx)"}
            </p>
          </div>
          <Switch
            id={toggleId}
            checked={!seeUseOlsInflation}
            onCheckedChange={(v) => onToggleSeeOlsInflation(!v)}
            aria-label="Alternar para a aproximação legada √(1+step/n) no modo SEE"
          />
        </div>
      )}

      <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
        σ menor = ajuste mais aderente · |slope| baixo = sem tendência clara · SSE cresce com ruído residual.
      </p>
    </details>
  );
});
