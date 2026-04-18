import type { QuotaRiskLevel, QuotaActionType } from "@/hooks/revenue/useQuotaAttainmentPredictor";

export const RISK_HSL: Record<QuotaRiskLevel, string> = {
  safe: "hsl(var(--success))",
  on_track: "hsl(var(--primary))",
  at_risk: "hsl(var(--warning))",
  critical: "hsl(var(--destructive))",
};

export const RISK_LABEL: Record<QuotaRiskLevel, string> = {
  safe: "Seguro",
  on_track: "No ritmo",
  at_risk: "Em risco",
  critical: "Crítico",
};

export const RISK_BADGE: Record<QuotaRiskLevel, "default" | "secondary" | "destructive" | "outline"> = {
  safe: "default",
  on_track: "secondary",
  at_risk: "outline",
  critical: "destructive",
};

export const ACTION_LABEL: Record<QuotaActionType, string> = {
  close_deal: "Fechar deal",
  generate_pipeline: "Gerar pipeline",
  increase_ticket: "Aumentar ticket",
  accelerate_stage: "Acelerar estágio",
};

export function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function fmtPct(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}
