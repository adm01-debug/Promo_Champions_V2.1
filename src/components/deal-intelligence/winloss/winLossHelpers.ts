export type Severity = "info" | "opportunity" | "risk";

export const severityLabel: Record<Severity, string> = {
  info: "Informação",
  opportunity: "Oportunidade",
  risk: "Risco",
};

export const severityClasses: Record<Severity, string> = {
  info: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  opportunity: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  risk: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

export const STAGE_LABELS_PT: Record<string, string> = {
  lead: "Lead",
  prospecting: "Prospecção",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
  closed_won: "Ganho",
  closed_lost: "Perdido",
};

export const stageLabel = (s: string | null | undefined) =>
  s ? STAGE_LABELS_PT[s.toLowerCase()] ?? s : "—";

export const fmtBRL = (n: number | null | undefined) => {
  const v = Number(n) || 0;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
};

export const fmtPct = (n: number | null | undefined) => `${(Number(n) || 0).toFixed(1)}%`;
export const fmtDays = (n: number | null | undefined) => `${(Number(n) || 0).toFixed(1)}d`;

export const insightTypeLabel: Record<string, string> = {
  win_pattern: "Padrão de Vitória",
  loss_pattern: "Padrão de Derrota",
  competitor: "Concorrência",
  icp: "Perfil Ideal",
  process: "Processo",
};
