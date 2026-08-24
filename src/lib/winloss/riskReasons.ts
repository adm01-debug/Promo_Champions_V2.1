/**
 * Canonical risk reason codes shared between the backend (detect-winloss-at-risk
 * edge function) and the frontend UI. Strings PT-BR are the user-facing copy;
 * the codes are the stable, machine-readable identity for filters/tests/i18n.
 */
import { Clock, DollarSign, Layers, Swords, Info, type LucideIcon } from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";

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

export const RISK_REASON_LABELS: Record<RiskReasonCode, string> = {
  STAGNATION_HIGH: "Estagnação severa",
  STAGNATION_LOW: "Estagnação leve",
  AMOUNT_ALIGNED: "Ticket alinhado",
  STAGE_STUCK: "Estágio travado",
  COMPETITOR_PRESSURE: "Pressão competitiva",
  CROSSED_SIGNALS: "Sinais cruzados",
};

export interface ReasonKindMeta {
  icon: LucideIcon;
  label: string;
  variant: BadgeProps["variant"];
  color: string;
  source: RiskReasonSource;
  contribMax: number | null;
}

const META_BY_SOURCE: Record<RiskReasonSource, Omit<ReasonKindMeta, "label" | "contribMax">> = {
  stagnation: { icon: Clock, variant: "warning", color: "text-warning", source: "stagnation" },
  amount: { icon: DollarSign, variant: "qualified", color: "text-primary", source: "amount" },
  stage: { icon: Layers, variant: "secondary", color: "text-secondary-foreground", source: "stage" },
  competitor: { icon: Swords, variant: "destructive", color: "text-destructive", source: "competitor" },
  generic: { icon: Info, variant: "outline", color: "text-muted-foreground", source: "generic" },
};

const CODE_TO_SOURCE: Record<RiskReasonCode, RiskReasonSource> = {
  STAGNATION_HIGH: "stagnation",
  STAGNATION_LOW: "stagnation",
  AMOUNT_ALIGNED: "amount",
  STAGE_STUCK: "stage",
  COMPETITOR_PRESSURE: "competitor",
  CROSSED_SIGNALS: "generic",
};

const CODE_CONTRIB_MAX: Record<RiskReasonCode, number | null> = {
  STAGNATION_HIGH: 50,
  STAGNATION_LOW: 50,
  AMOUNT_ALIGNED: 25,
  STAGE_STUCK: 25,
  COMPETITOR_PRESSURE: null,
  CROSSED_SIGNALS: null,
};

export function getReasonKindMeta(code: RiskReasonCode): ReasonKindMeta {
  const source = CODE_TO_SOURCE[code];
  const base = META_BY_SOURCE[source];
  return {
    ...base,
    label: RISK_REASON_LABELS[code],
    contribMax: CODE_CONTRIB_MAX[code],
  };
}

/**
 * Best-effort fallback for legacy payloads that don't carry `reasons_v2`.
 * Maps a free-form PT-BR reason message to a canonical code.
 */
export function inferReasonCode(message: string): RiskReasonCode {
  const m = message ?? "";
  if (/dias sem atualização/i.test(m)) {
    return /\(média de loss/i.test(m) ? "STAGNATION_HIGH" : "STAGNATION_LOW";
  }
  if (/^ticket alinhado/i.test(m)) return "AMOUNT_ALIGNED";
  if (/estágio .* travado/i.test(m)) return "STAGE_STUCK";
  if (/pressão competitiva/i.test(m)) return "COMPETITOR_PRESSURE";
  return "CROSSED_SIGNALS";
}

export function isRiskReasonCode(value: unknown): value is RiskReasonCode {
  return typeof value === "string" && (RISK_REASON_CODES as readonly string[]).includes(value);
}
