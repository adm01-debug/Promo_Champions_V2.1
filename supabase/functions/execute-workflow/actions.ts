// Montagem das linhas gravadas pelas ações create_task e log_activity.
// Módulo puro (sem Deno/Supabase) para ser testado também pelo vitest.

// activities.outcome é enum activity_outcome NOT NULL — "completed" não existe
// nele. "connected" é o mesmo default do formulário de atividade
// (src/components/activities/ActivityLogForm.tsx) e do ai-agent-orchestrator.
export const WORKFLOW_ACTIVITY_OUTCOME = "connected";

// salespersonId é salespeople.id (FK de agenda_events e activities), nunca o
// auth.users.id do chamador.
export function buildTaskRow(
  params: Record<string, unknown>,
  salespersonId: string,
  saleId: unknown,
  now: number,
): Record<string, unknown> {
  return {
    salesperson_id: salespersonId,
    sale_id: saleId ?? null,
    title: String(params.title ?? "Tarefa automatizada"),
    description: String(params.description ?? ""),
    event_type: "task",
    scheduled_at: new Date(now + Number(params.delay_hours ?? 24) * 3600_000).toISOString(),
  };
}

export function buildActivityRow(
  params: Record<string, unknown>,
  salespersonId: string,
  saleId: unknown,
): Record<string, unknown> {
  return {
    salesperson_id: salespersonId,
    sale_id: saleId ?? null,
    activity_type: String(params.activity_type ?? "note"),
    outcome: WORKFLOW_ACTIVITY_OUTCOME,
    notes: String(params.notes ?? "Automação executada"),
  };
}
