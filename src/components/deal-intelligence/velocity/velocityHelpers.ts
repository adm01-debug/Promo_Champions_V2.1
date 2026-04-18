export type StageSeverity = "watch" | "stuck" | "critical";

export const severityLabel = (s: StageSeverity): string => ({
  watch: "Atenção",
  stuck: "Travado",
  critical: "Crítico",
}[s]);

export const severityClasses = (s: StageSeverity): string => ({
  watch: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  stuck: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
}[s]);

export const severityBarColor = (s: StageSeverity): string => ({
  watch: "bg-amber-500",
  stuck: "bg-orange-500",
  critical: "bg-destructive",
}[s]);

export const stageLabel = (stage: string): string => {
  const map: Record<string, string> = {
    lead: "Lead",
    prospecting: "Prospecção",
    qualified: "Qualificado",
    proposal: "Proposta",
    negotiation: "Negociação",
    contract: "Contrato",
    completed: "Fechado",
    lost: "Perdido",
  };
  return map[stage?.toLowerCase()] || stage || "—";
};

export const formatHours = (h?: number | null): string => {
  if (h == null || !isFinite(Number(h))) return "—";
  const hours = Number(h);
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 14) return `${days.toFixed(1)} dias`;
  return `${Math.round(days)} dias`;
};

export const STAGE_RECOMMENDATIONS: Record<string, string> = {
  lead: "Qualifique rapidamente: defina BANT e marque discovery call.",
  prospecting: "Follow-up multicanal e identifique a dor principal.",
  qualified: "Apresente solução personalizada e mapeie comitê de compra.",
  proposal: "Confirme objeções pendentes e marque reunião com decisor.",
  negotiation: "Faça concessões mensuráveis e estabeleça prazo de fechamento.",
  contract: "Acompanhe assinatura e remova bloqueios jurídicos/financeiros.",
};
