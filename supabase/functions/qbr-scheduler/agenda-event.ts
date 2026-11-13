// Linha de agenda_events gerada para uma QBR. Módulo puro (sem Deno) para ser
// testado pelo vitest. Os valores precisam respeitar os CHECKs de produção:
// agenda_events_event_type_check (reminder|follow_up|meeting|call|task) e
// agenda_events_status_check (pending|in_progress|completed|cancelled).
// Não existe tipo "qbr": a QBR é uma reunião, identificada pelo prefixo do título.
export const QBR_EVENT_TYPE = "meeting";
export const QBR_EVENT_STATUS = "pending";
export const QBR_TITLE_PREFIX = "QBR ";

export function buildQbrAgendaEvent(
  schedule: { owner_salesperson_id: string; next_qbr_at: string; frequency: string },
  accountName: string,
): Record<string, unknown> {
  return {
    salesperson_id: schedule.owner_salesperson_id,
    event_type: QBR_EVENT_TYPE,
    title: `${QBR_TITLE_PREFIX}${schedule.frequency} — ${accountName}`,
    description: `Quarterly Business Review com ${accountName}. Revisar métricas, ROI, roadmap e expansão.`,
    scheduled_at: new Date(`${schedule.next_qbr_at}T14:00:00Z`).toISOString(),
    priority: "high",
    status: QBR_EVENT_STATUS,
    reminder_minutes_before: 1440,
  };
}
