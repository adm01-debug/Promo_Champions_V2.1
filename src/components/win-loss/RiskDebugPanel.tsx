import { Badge } from "@/components/ui/badge";
import type { RiskBreakdown } from "@/hooks/win-loss/useAtRiskFromPatterns";

const fmtBRL = (n: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n || 0);

interface ContribRow {
  label: string;
  value: number;
  max: number;
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden" aria-hidden>
      <div className="h-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function RiskDebugPanel({ breakdown, riskScore }: { breakdown: RiskBreakdown; riskScore: number }) {
  const rows: ContribRow[] = [
    { label: "Estagnação", value: breakdown.stagnation, max: 50 },
    { label: "Alinhamento de ticket", value: breakdown.amount_alignment, max: 25 },
    { label: "Estágio travado", value: breakdown.stage_match, max: 25 },
  ];
  const raw = breakdown.raw_score ?? rows.reduce((s, r) => s + r.value, 0);
  const conf = breakdown.confidence_weight ?? Math.max(0.5, Math.min(1, breakdown.matched_confidence));
  const final = breakdown.final_score ?? riskScore;

  return (
    <div
      className="mt-2 rounded-md border border-border bg-background/60 p-3 space-y-3 text-xs"
      aria-label="Detalhes de cálculo do risco"
    >
      {/* Contribuições */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Contribuição</p>
        {rows.map(r => (
          <div key={r.label} className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="tabular-nums font-medium">
                {r.value}<span className="text-muted-foreground">/{r.max}</span>
              </span>
            </div>
            <Bar value={r.value} max={r.max} />
          </div>
        ))}
      </div>

      {/* Fórmula */}
      <div className="rounded bg-muted/50 px-2 py-1.5 font-mono text-[11px] tabular-nums">
        raw {raw} × conf {conf.toFixed(2)} = <span className="font-bold text-foreground">{final}</span>
      </div>

      {/* Padrão casado */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Padrão dominante</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium">{breakdown.matched_pattern_label}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {breakdown.matched_pattern_type}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 tabular-nums">
            conf {Math.round(breakdown.matched_confidence * 100)}%
          </Badge>
        </div>
      </div>

      {/* Sinais detectados */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sinais detectados</p>
        <div className="flex items-center gap-1 flex-wrap">
          {breakdown.stage_eligible && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">estágio elegível</Badge>
          )}
          {(breakdown.matched_keywords ?? []).map(k => (
            <Badge key={k} variant="warning" className="text-[10px] px-1.5 py-0">{k}</Badge>
          ))}
          {breakdown.days_stagnant !== undefined && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 tabular-nums">
              {breakdown.days_stagnant}d / {breakdown.avg_loss_cycle_days ?? "—"}d ciclo médio
            </Badge>
          )}
          {breakdown.avg_loss_amount != null && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 tabular-nums">
              ticket alvo {fmtBRL(breakdown.avg_loss_amount)}
            </Badge>
          )}
          {!breakdown.stage_eligible &&
            !(breakdown.matched_keywords ?? []).length &&
            breakdown.days_stagnant === undefined && (
              <span className="text-muted-foreground italic">Nenhum sinal específico</span>
            )}
        </div>
      </div>

      {/* Razões completas */}
      {breakdown.reasons.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Razões</p>
          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
            {breakdown.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
