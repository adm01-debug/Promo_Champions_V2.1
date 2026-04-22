import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  trigger_type: string;
  estimated_time_saved_minutes: number;
  priority: "high" | "medium" | "low";
  rationale: string;
  template: {
    name: string;
    trigger_type: string;
    trigger_config: Record<string, unknown>;
    conditions: unknown[];
    actions: unknown[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Gather signals
    const [{ data: workflows }, { data: stagnantDeals }, { data: recentRuns }] = await Promise.all([
      supabase.from("automation_workflows").select("trigger_type, is_active, run_count"),
      supabase.from("sales").select("id, stage, updated_at").not("status", "in", "(completed,lost,cancelled)").lt("updated_at", new Date(Date.now() - 7 * 86400000).toISOString()).limit(50),
      supabase.from("automation_runs").select("status, duration_ms").gte("started_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    ]);

    const activeTriggers = new Set((workflows ?? []).filter((w) => w.is_active).map((w) => w.trigger_type));
    const totalRuns = recentRuns?.length ?? 0;
    const successRuns = (recentRuns ?? []).filter((r) => r.status === "completed").length;
    const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;
    const avgDuration = totalRuns > 0 ? Math.round((recentRuns ?? []).reduce((s, r) => s + (r.duration_ms ?? 0), 0) / totalRuns) : 0;
    const timeSavedMinutes = totalRuns * 5; // 5 min saved per automation run

    const suggestions: Suggestion[] = [];

    // Suggestion 1: Reactivate stagnant deals
    if ((stagnantDeals?.length ?? 0) >= 5 && !activeTriggers.has("no_activity_days")) {
      suggestions.push({
        id: "reactivate-stagnant",
        title: "Reativar deals parados há 7+ dias",
        description: `Detectamos ${stagnantDeals?.length ?? 0} deals sem atividade recente. Crie uma automação para gerar tarefas de follow-up automaticamente.`,
        trigger_type: "no_activity_days",
        estimated_time_saved_minutes: (stagnantDeals?.length ?? 0) * 3,
        priority: "high",
        rationale: "Deals parados perdem 8% de chance de fechamento por semana. Esta automação cria tarefas proativas.",
        template: {
          name: "Reativação automática (7 dias)",
          trigger_type: "no_activity_days",
          trigger_config: { days: 7 },
          conditions: [{ field: "stage", operator: "neq", value: "lost" }],
          actions: [
            { type: "create_task", params: { title: "Reativar deal parado", priority: "high" } },
            { type: "send_notification", params: { message: "Deal sem atividade há 7 dias" } },
          ],
        },
      });
    }

    // Suggestion 2: Welcome new deals
    if (!activeTriggers.has("deal_created")) {
      suggestions.push({
        id: "welcome-deals",
        title: "Onboarding automático de novos deals",
        description: "Quando um deal é criado, dispare tarefas de qualificação e notifique o owner.",
        trigger_type: "deal_created",
        estimated_time_saved_minutes: 10,
        priority: "medium",
        rationale: "Padroniza o início de cada deal e reduz tempo manual de criação de tarefas.",
        template: {
          name: "Onboarding de novo deal",
          trigger_type: "deal_created",
          trigger_config: {},
          conditions: [],
          actions: [
            { type: "create_task", params: { title: "Qualificar lead (BANT)", priority: "high" } },
            { type: "log_activity", params: { activity_type: "note", notes: "Deal criado — iniciar qualificação" } },
          ],
        },
      });
    }

    // Suggestion 3: Stage progression alerts
    if (!activeTriggers.has("stage_changed")) {
      suggestions.push({
        id: "stage-alert",
        title: "Alertas de progresso no funil",
        description: "Notifique gestores quando deals avançarem para Proposta ou Negociação.",
        trigger_type: "stage_changed",
        estimated_time_saved_minutes: 5,
        priority: "low",
        rationale: "Mantém liderança alinhada com avanços importantes do pipeline.",
        template: {
          name: "Alerta de avanço para Proposta/Negociação",
          trigger_type: "stage_changed",
          trigger_config: { target_stages: ["proposal", "negotiation"] },
          conditions: [],
          actions: [
            { type: "send_notification", params: { message: "Deal avançou para estágio crítico" } },
          ],
        },
      });
    }

    return new Response(
      JSON.stringify({
        suggestions,
        roi_metrics: {
          total_runs_30d: totalRuns,
          success_rate_pct: successRate,
          avg_duration_ms: avgDuration,
          estimated_time_saved_minutes: timeSavedMinutes,
          estimated_time_saved_hours: Math.round(timeSavedMinutes / 60),
        },
        active_workflows: (workflows ?? []).filter((w) => w.is_active).length,
        total_workflows: workflows?.length ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("automation-suggestions error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
