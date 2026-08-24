import type { RiskLevel } from "@/hooks/revenue/useQuotaAttainment";

export const RISK_COLOR: Record<RiskLevel, string> = {
  safe: "hsl(var(--success))",
  on_track: "hsl(var(--primary))",
  at_risk: "hsl(var(--warning))",
  critical: "hsl(var(--destructive))",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  safe: "Seguro",
  on_track: "No ritmo",
  at_risk: "Em risco",
  critical: "Crítico",
};

export const RISK_BADGE: Record<RiskLevel, "default" | "secondary" | "destructive" | "outline"> = {
  safe: "default",
  on_track: "secondary",
  at_risk: "outline",
  critical: "destructive",
};

export function classifyRisk(prob: number): RiskLevel {
  if (prob >= 0.8) return "safe";
  if (prob >= 0.5) return "on_track";
  if (prob >= 0.25) return "at_risk";
  return "critical";
}

export function formatCurrency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function formatPace(v: number): string {
  return `${formatCurrency(v)}/dia`;
}

export function formatPct(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}
