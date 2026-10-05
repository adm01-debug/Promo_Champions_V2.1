/**
 * CONTRATO COMPARTILHADO front/edge — win-loss at-risk.
 *
 * Fonte única de verdade para as regras que antes existiam duplicadas em
 * `supabase/functions/detect-winloss-at-risk/scoring.ts` (edge) e
 * `src/lib/winloss/*` (frontend). Ambos os lados importam deste módulo;
 * `src/lib/winloss/winlossContract.test.ts` garante que os adaptadores do
 * frontend batem com o que a edge executa.
 *
 * Puro TypeScript — sem imports Deno nem DOM — para ser importado dos dois lados.
 */

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type RiskReasonCode =
  | "STAGNATION_HIGH"
  | "STAGNATION_LOW"
  | "AMOUNT_ALIGNED"
  | "STAGE_STUCK"
  | "COMPETITOR_PRESSURE"
  | "CROSSED_SIGNALS";

export const RISK_REASON_CODES: readonly RiskReasonCode[] = [
  "STAGNATION_HIGH",
  "STAGNATION_LOW",
  "AMOUNT_ALIGNED",
  "STAGE_STUCK",
  "COMPETITOR_PRESSURE",
  "CROSSED_SIGNALS",
] as const;

export type RiskReasonSource =
  | "stagnation"
  | "amount"
  | "stage"
  | "competitor"
  | "generic";

export interface RiskReason {
  code: RiskReasonCode;
  message: string;
  params: Record<string, string | number>;
  source: RiskReasonSource;
  contribution: number;
}

/** Labels pt-BR canônicos por código (user-facing; compartilhados com a UI). */
export const RISK_REASON_LABELS: Record<RiskReasonCode, string> = {
  STAGNATION_HIGH: "Estagnação severa",
  STAGNATION_LOW: "Estagnação leve",
  AMOUNT_ALIGNED: "Ticket alinhado",
  STAGE_STUCK: "Estágio travado",
  COMPETITOR_PRESSURE: "Pressão competitiva",
  CROSSED_SIGNALS: "Sinais cruzados",
};

export interface CompetitorMatch {
  keyword: string;
  matched_substring: string;
  regex: string;
  confidence: number;
}

// ── Limiares canônicos ──────────────────────────────────────────────────────
export const SEVERITY_CRITICAL_MIN = 80;
export const SEVERITY_HIGH_MIN = 65;
export const SEVERITY_MEDIUM_MIN = 50;
export const CRITICAL_CONFIDENCE_MIN = 0.7;
/** Score mínimo para um deal entrar na lista de at-risk. */
export const DEAL_RISK_THRESHOLD = 40;

/** Status de deal "traváveis" (estágios intermediários do funil). */
export const STUCK_STATUSES = new Set([
  "negotiation",
  "proposal",
  "qualified",
  "pending",
]);

/** pattern_types que têm ramo próprio na matriz de ações sugeridas. */
export const CANONICAL_PATTERN_TYPES = new Set([
  "loss_factor",
  "stuck_stage",
  "competitor",
  "win_factor",
]);

export function severityFromScore(
  score: number,
  confidence: number | null | undefined,
): RiskSeverity {
  const c = Math.max(0, Math.min(1, confidence ?? 0.5));
  if (score >= SEVERITY_CRITICAL_MIN && c >= CRITICAL_CONFIDENCE_MIN) return "critical";
  if (score >= SEVERITY_HIGH_MIN) return "high";
  if (score >= SEVERITY_MEDIUM_MIN) return "medium";
  return "low";
}

// ── Detecção de sinal competitivo (regex canônica) ──────────────────────────
export const COMPETITOR_KEYWORDS_RE = /concorr\w*|competitor\w*|leila\w*|cota[cç]\w*/gi;

const COMPETITOR_REGEX_LABEL: Array<[string, string]> = [
  ["concorr", "/concorr\\w*/i"],
  ["competitor", "/competitor\\w*/i"],
  ["leila", "/leila\\w*/i"],
  ["cota", "/cota[c\u00e7]\\w*/i"],
];

function attributeRegexSource(hit: string): string {
  const lower = hit.toLowerCase();
  for (const [needle, label] of COMPETITOR_REGEX_LABEL) {
    if (lower.includes(needle)) return label;
  }
  return "/" + COMPETITOR_KEYWORDS_RE.source + "/gi";
}

/**
 * Detailed competitor matches with original substring and originating regex.
 * Dedup by lowercased keyword preserving first occurrence.
 */
export function extractCompetitorMatches(
  source: string | null | undefined,
  confidence = 0.5,
): CompetitorMatch[] {
  if (!source) return [];
  // Split on commas / whitespace to recover the "token" each match lives in.
  const tokens = source.split(/[\s,;]+/).filter(Boolean);
  const seen = new Set<string>();
  const out: CompetitorMatch[] = [];
  for (const token of tokens) {
    const m = token.match(COMPETITOR_KEYWORDS_RE);
    if (!m) continue;
    for (const hit of m) {
      const key = hit.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        keyword: hit,
        matched_substring: token,
        regex: attributeRegexSource(hit),
        confidence,
      });
    }
  }
  return out;
}

export function extractCompetitorKeywords(source: string | null | undefined): string[] {
  return extractCompetitorMatches(source).map(m => m.keyword);
}

// ── Matriz de ações sugeridas ───────────────────────────────────────────────
interface ActionOpts {
  outcome?: string | null;
  severity: RiskSeverity;
}

/** Frase de override para padrões de vitória (saída única, usada no contrato). */
export const WIN_OVERRIDE_ACTION =
  "Reaplicar abordagem consultiva vencedora deste perfil de cliente";

/**
 * Suggested action coherent with pattern type, outcome and severity.
 * `win_factor` patterns (positive outcome) never produce urgency markers.
 * Critical/high severity on loss-related patterns get urgency markers
 * ("URGENTE", "IMEDIATA", "24h"). Medium/low get measured language.
 */
export function suggestedActionFor(
  patternType: string,
  status: string | null,
  opts: ActionOpts,
): string {
  const sev = opts.severity;
  const outcome = (opts.outcome ?? "").toLowerCase();
  const stage = status ?? "atual";

  // Positive patterns — never urgent, regardless of severity.
  if (patternType === "win_factor" || outcome === "won") {
    return WIN_OVERRIDE_ACTION;
  }

  switch (patternType) {
    case "loss_factor":
      if (sev === "critical")
        return "AÇÃO IMEDIATA: agendar call de resgate em 24h e revisar proposta com condição estratégica";
      if (sev === "high")
        return "Revisar proposta nas próximas 48h com foco em valor percebido e desbloqueio";
      if (sev === "medium")
        return "Reforçar valor percebido e ajustar narrativa de ROI nesta semana";
      return "Revisar abordagem e confirmar interesse do cliente nas próximas semanas";

    case "stuck_stage":
      if (sev === "critical")
        return `URGENTE: desbloquear estágio "${stage}" hoje — escalar para gestor se necessário`;
      if (sev === "high")
        return `Acelerar saída do estágio "${stage}" com próxima ação concreta em 48h`;
      if (sev === "medium")
        return `Definir próxima ação para destravar estágio "${stage}" esta semana`;
      return `Revisar estágio "${stage}" e confirmar critério de avanço`;

    case "competitor":
      if (sev === "critical")
        return "Concorrência ativa detectada — disparar battle card e ligar ao decisor em 24h";
      if (sev === "high")
        return "Reforçar diferenciação competitiva e adicionar prova social em 48h";
      if (sev === "medium")
        return "Revisar posicionamento competitivo e preparar contra-argumentos";
      return "Confirmar se há concorrente no deal e mapear objeções";

    default:
      if (sev === "critical")
        return "Revisar deal urgente com gestor — múltiplos sinais de risco cruzados";
      if (sev === "high")
        return "Revisar abordagem com o cliente nas próximas 48h";
      if (sev === "medium")
        return "Revisar abordagem com o cliente nas próximas 72h";
      return "Confirmar próximo passo do deal com o cliente";
  }
}
