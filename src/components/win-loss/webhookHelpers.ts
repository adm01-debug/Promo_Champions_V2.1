// Mapeamento de event → rótulo amigável (PT-BR).
// Eventos não mapeados (ou ausentes) caem no fallback "Evento desconhecido".
export const EVENT_LABELS: Record<string, string> = {
  "winloss.deal.won": "Negócio ganho",
  "winloss.deal.lost": "Negócio perdido",
  "winloss.deal.updated": "Negócio atualizado",
  "winloss.deal.stage_changed": "Mudança de estágio",
  "winloss.deal.at_risk": "Negócio em risco",
  "winloss.forecast.updated": "Forecast atualizado",
  "winloss.battlecard.created": "Battlecard criado",
  "quote.created": "Orçamento criado",
  "quote.updated": "Orçamento atualizado",
  "quote.accepted": "Orçamento aceito",
  "quote.rejected": "Orçamento rejeitado",
};

export function getEventLabel(event: string | null | undefined): string {
  if (!event || event.trim().length === 0 || event === "unknown") {
    return "Evento desconhecido";
  }
  return EVENT_LABELS[event] ?? event;
}
