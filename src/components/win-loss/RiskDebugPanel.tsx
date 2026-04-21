import { Swords, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RiskBreakdown, RiskReason } from "@/hooks/win-loss/useAtRiskFromPatterns";
import {
  getReasonKindMeta,
  inferReasonCode,
} from "@/lib/winloss/riskReasons";
import {
  SEVERITY_RULES,
  deriveSeverity,
  explainSeverity,
  summarizeActionMatrix,
  type RiskSeverity,
} from "@/lib/winloss/riskSeverity";

/** Build a RiskReason-shaped record from a legacy free-form string. */
function reasonFromLegacy(message: string, b: RiskBreakdown): RiskReason {
  const code = inferReasonCode(message);
  let contribution = 0;
  switch (code) {
    case "STAGNATION_HIGH":
    case "STAGNATION_LOW":
      contribution = b.stagnation;
      break;
    case "AMOUNT_ALIGNED":
      contribution = b.amount_alignment;
      break;
    case "STAGE_STUCK":
      contribution = b.stage_match;
      break;
    case "COMPETITOR_PRESSURE":
      contribution = b.matched_keywords?.length ?? 0;
      break;
    default:
      contribution = 0;
  }
  return {
    code,
    message,
    params: {},
    source: getReasonKindMeta(code).source,
    contribution,
  };
}

function resolveReasons(b: RiskBreakdown): RiskReason[] {
  if (b.reasons_v2 && b.reasons_v2.length > 0) return b.reasons_v2;
  return (b.reasons ?? []).map((m) => reasonFromLegacy(m, b));
}

/**
 * Wrap numeric tokens (e.g. "23", "18d", "45.000") in <mark> for visual emphasis.
 * Skips already-rendered keyword pills (handled separately for "competitor" kind).
 */
function highlightNumbers(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\d[\d.,]*d?)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <mark
        key={`n-${i++}`}
        className="bg-primary/10 text-primary px-0.5 rounded font-medium tabular-nums"
      >
        {m[0]}
      </mark>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/**
 * For competitor reasons, replace the parenthetical "(kw1, kw2)" with inline warning pills.
 */
function renderCompetitorReason(reason: string, keywords: string[]): React.ReactNode {
  const parenIdx = reason.lastIndexOf("(");
  const head = parenIdx > -1 ? reason.slice(0, parenIdx).trimEnd() : reason;
  return (
    <>
      <span>{head}</span>
      {keywords.length > 0 && (
        <span className="ml-1 inline-flex flex-wrap gap-1 align-middle">
          {keywords.map((kw) => (
            <Badge key={kw} variant="warning" className="text-[10px] px-1.5 py-0">
              {kw}
            </Badge>
          ))}
        </span>
      )}
    </>
  );
}


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

interface RiskDebugPanelProps {
  breakdown: RiskBreakdown;
  riskScore: number;
  suggestedAction?: string;
  outcome?: string | null;
}

export function RiskDebugPanel({ breakdown, riskScore, suggestedAction, outcome }: RiskDebugPanelProps) {
  const rows: ContribRow[] = [
    { label: "Estagnação", value: breakdown.stagnation, max: 50 },
    { label: "Alinhamento de ticket", value: breakdown.amount_alignment, max: 25 },
    { label: "Estágio travado", value: breakdown.stage_match, max: 25 },
  ];
  const raw = breakdown.raw_score ?? rows.reduce((s, r) => s + r.value, 0);
  const conf = breakdown.confidence_weight ?? Math.max(0.5, Math.min(1, breakdown.matched_confidence));
  const final = breakdown.final_score ?? riskScore;
  const derived: RiskSeverity = deriveSeverity(final, breakdown.matched_confidence);
  const matrix = summarizeActionMatrix(breakdown.matched_pattern_type, derived, outcome);

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

      {/* Fórmula passo a passo */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Fórmula passo a passo
        </p>
        <ol className="space-y-1 font-mono text-[11px] tabular-nums">
          <li className="rounded bg-muted/40 px-2 py-1">
            <span className="text-muted-foreground mr-1">1.</span>
            <span className="text-muted-foreground">raw =</span>{" "}
            <span>{breakdown.stagnation}</span>
            <span className="text-muted-foreground"> (estag)</span>
            {" + "}
            <span>{breakdown.amount_alignment}</span>
            <span className="text-muted-foreground"> (ticket)</span>
            {" + "}
            <span>{breakdown.stage_match}</span>
            <span className="text-muted-foreground"> (estágio)</span>
            {" = "}
            <span className="font-bold text-foreground">{raw}</span>
            <span className="text-muted-foreground">/100</span>
          </li>

          <li className="rounded bg-muted/40 px-2 py-1">
            <span className="text-muted-foreground mr-1">2.</span>
            <span className="text-muted-foreground">conf_weight = max(0.5, min(1,</span>{" "}
            <span>{breakdown.matched_confidence.toFixed(2)}</span>
            <span className="text-muted-foreground">)) =</span>{" "}
            <span className="font-bold text-foreground">{conf.toFixed(2)}</span>
            {breakdown.matched_confidence < 0.5 && (
              <span className="text-muted-foreground ml-1">(piso aplicado)</span>
            )}
            {breakdown.matched_confidence > 1 && (
              <span className="text-muted-foreground ml-1">(teto aplicado)</span>
            )}
          </li>

          <li className="rounded bg-muted/40 px-2 py-1">
            <span className="text-muted-foreground mr-1">3.</span>
            <span className="text-muted-foreground">round(</span>
            <span>{raw}</span>
            <span className="text-muted-foreground"> × </span>
            <span>{conf.toFixed(2)}</span>
            <span className="text-muted-foreground">) =</span>{" "}
            <span className="font-bold text-foreground">{Math.round(raw * conf)}</span>
          </li>

          <li className="rounded bg-primary/10 border border-primary/20 px-2 py-1">
            <span className="text-muted-foreground mr-1">4.</span>
            <span className="text-muted-foreground">clamp(0, 100) → final =</span>{" "}
            <span className="font-bold text-foreground">{final}</span>
            <span className="text-muted-foreground">/100</span>
            {Math.round(raw * conf) > 100 && (
              <span className="text-muted-foreground ml-1">(teto 100 aplicado)</span>
            )}
            {Math.round(raw * conf) < 0 && (
              <span className="text-muted-foreground ml-1">(piso 0 aplicado)</span>
            )}
          </li>
        </ol>
      </div>

      {/* Severidade — qual regra acionou e qual matriz produziu a action */}
      <div className="space-y-1.5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Severidade</p>
          <p className="text-[10px] text-muted-foreground/80">
            primeira regra que casa com (final, conf) define o nível
          </p>
        </div>
        <ul className="space-y-1 font-mono text-[11px] tabular-nums">
          {SEVERITY_RULES.map((rule) => {
            const isMatch = rule.severity === derived;
            const Icon = isMatch ? CheckCircle2 : XCircle;
            return (
              <li
                key={rule.severity}
                data-severity-rule={rule.severity}
                data-severity-active={isMatch ? "true" : "false"}
                aria-current={isMatch ? "true" : undefined}
                className={`flex items-center justify-between gap-2 rounded px-2 py-1 ${
                  isMatch
                    ? "bg-primary/10 border border-primary/30 text-foreground"
                    : "bg-muted/30 text-muted-foreground/70"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon
                    className={`h-3 w-3 shrink-0 ${isMatch ? "text-primary" : "text-muted-foreground/50"}`}
                    aria-hidden
                  />
                  <span className="uppercase font-semibold">{rule.severity}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="truncate">{rule.expression}</span>
                </div>
                {isMatch && (
                  <span className="text-muted-foreground shrink-0">
                    final={final} conf={conf.toFixed(2)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {/* Matriz de ação acionada */}
        <div
          className="rounded border border-primary/30 bg-primary/5 px-2 py-1.5 space-y-1"
          data-action-matrix-kind={matrix.kind}
          aria-label={`Matriz de ação: ${matrix.label}`}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Matriz de ação
            </span>
            <Badge
              variant={
                matrix.kind === "win-override" ? "success" :
                matrix.kind === "default-fallback" ? "outline" : "secondary"
              }
              className="text-[10px] px-1.5 py-0"
            >
              {matrix.kind === "win-override"
                ? "override"
                : matrix.kind === "default-fallback"
                ? "fallback"
                : "matriz"}
            </Badge>
            <code className="text-[11px] font-mono">{matrix.label}</code>
          </div>
          {suggestedAction && (
            <p className="text-xs text-foreground leading-snug">
              <span className="text-muted-foreground">→ </span>
              {suggestedAction}
            </p>
          )}
        </div>
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
          {breakdown.severity && (
            <Badge
              variant={
                breakdown.severity === "critical" ? "destructive" :
                breakdown.severity === "high" ? "warning" :
                breakdown.severity === "medium" ? "secondary" : "outline"
              }
              className="text-[10px] px-1.5 py-0 uppercase"
            >
              {breakdown.severity}
            </Badge>
          )}
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

      {/* Keywords competitivas detectadas (regex + substring + confiança) */}
      {breakdown.competitor_matches && breakdown.competitor_matches.length > 0 && (
        <div className="space-y-1">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Keywords competitivas detectadas ({breakdown.competitor_matches.length})
            </p>
            <p className="text-[10px] text-muted-foreground/80">
              baseado no padrão de maior confiança do tipo competitor
            </p>
          </div>
          <ul className="space-y-1">
            {breakdown.competitor_matches.map((cm, i) => (
              <li
                key={`${cm.keyword}-${i}`}
                aria-label={`Keyword competitiva: ${cm.keyword}, casou em '${cm.matched_substring}' via ${cm.regex}, confiança ${Math.round(cm.confidence * 100)}%`}
                className="rounded border-l-2 border-destructive/60 bg-background/40 pl-2 pr-2 py-1 space-y-0.5"
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Swords className="h-3 w-3 text-destructive shrink-0" aria-hidden />
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    {cm.keyword}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 tabular-nums">
                    conf {Math.round(cm.confidence * 100)}%
                  </Badge>
                </div>
                <div className="font-mono text-[10px] flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>
                    <span className="text-muted-foreground">match:</span>{" "}
                    <span className="bg-muted px-1 rounded">"{cm.matched_substring}"</span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">regex:</span>{" "}
                    <span className="text-muted-foreground">{cm.regex}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Razões completas — cada item liga a um campo do cálculo acima */}
      {(() => {
        const resolved = resolveReasons(breakdown);
        if (resolved.length === 0) return null;
        return (
          <div className="space-y-1">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Razões</p>
              <p className="text-[10px] text-muted-foreground/80">
                cada item liga a um campo do cálculo acima
              </p>
            </div>
            <ul className="space-y-1">
              {resolved.map((reason, i) => {
                const meta = getReasonKindMeta(reason.code);
                const Icon = meta.icon;
                const contribValue = reason.contribution;
                const contribMax = meta.contribMax;
                const showContrib = contribMax != null;
                const ariaLabel = showContrib
                  ? `Razão de risco: ${meta.label} (${reason.code}), contribui ${contribValue}/${contribMax}`
                  : `Razão de risco: ${meta.label} (${reason.code})`;
                return (
                  <li
                    key={`${reason.code}-${i}`}
                    data-reason-code={reason.code}
                    aria-label={ariaLabel}
                    className="flex items-start gap-1.5 rounded border border-border/50 bg-background/40 px-2 py-1.5"
                  >
                    <Icon className={`h-3 w-3 mt-0.5 shrink-0 ${meta.color}`} aria-hidden />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant={meta.variant} className="text-[10px] px-1.5 py-0 tabular-nums">
                          {meta.label}
                          {showContrib && (
                            <span className="ml-1 opacity-80">{contribValue}/{contribMax}</span>
                          )}
                        </Badge>
                        <span className="text-[9px] font-mono text-muted-foreground/70">
                          {reason.code}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {reason.source === "competitor"
                          ? renderCompetitorReason(reason.message, breakdown.matched_keywords ?? [])
                          : highlightNumbers(reason.message)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })()}
    </div>
  );
}
