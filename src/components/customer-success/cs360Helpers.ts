export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function renewalSemaphore(days: number | null): "green" | "yellow" | "orange" | "red" | "gray" {
  if (days === null) return "gray";
  if (days < 0) return "red";
  if (days <= 30) return "red";
  if (days <= 60) return "orange";
  if (days <= 90) return "yellow";
  return "green";
}

export const RENEWAL_STATUS_LABEL: Record<string, string> = {
  upcoming: "A vencer",
  at_risk: "Em risco",
  renewed: "Renovado",
  churned: "Churn",
  lost: "Perdido",
};

export const TICKET_STATUS_LABEL: Record<string, string> = {
  open: "Aberto",
  pending: "Pendente",
  resolved: "Resolvido",
  closed: "Fechado",
};

export const ONBOARDING_STATUS_LABEL: Record<string, string> = {
  not_started: "Não iniciado",
  in_progress: "Em progresso",
  completed: "Concluído",
  stalled: "Travado",
};

export const EXPANSION_TYPE_LABEL: Record<string, string> = {
  upsell: "Upsell",
  cross_sell: "Cross-sell",
  expansion: "Expansão",
};
