import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface ActionDef {
  type: "create_task" | "send_notification" | "update_stage" | "log_activity" | "assign_owner";
  params: Record<string, unknown>;
}

interface ConditionDef {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "contains";
  value: unknown;
}

const evaluateCondition = (payload: Record<string, unknown>, cond: ConditionDef): boolean => {
  const v = payload[cond.field];
  switch (cond.operator) {
    case "eq": return v === cond.value;
    case "neq": return v !== cond.value;
    case "gt": return typeof v === "number" && typeof cond.value === "number" && v > cond.value;
    case "lt": return typeof v === "number" && typeof cond.value === "number" && v < cond.value;
    case "contains": return typeof v === "string" && typeof cond.value === "string" && v.includes(cond.value);
    default: return false;
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { workflow_id, trigger_payload = {} } = await req.json();
    if (!workflow_id) {
      return new Response(JSON.stringify({ error: "workflow_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const startedAt = Date.now();
    const { data: workflow, error: wErr } = await supabase
      .from("automation_workflows")
      .select("*")
      .eq("id", workflow_id)
      .eq("is_active", true)
      .maybeSingle();

    if (wErr || !workflow) {
      return new Response(JSON.stringify({ error: "Workflow not found or inactive" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const conditions = (workflow.conditions as ConditionDef[]) || [];
    const allConditionsMet = conditions.every((c) => evaluateCondition(trigger_payload, c));

    const executed: Array<{ action: string; status: string; result?: unknown; error?: string }> = [];

    if (!allConditionsMet) {
      await supabase.from("automation_runs").insert({
        workflow_id,
        status: "skipped",
        trigger_payload,
        actions_executed: [],
        duration_ms: Date.now() - startedAt,
        completed_at: new Date().toISOString(),
      });
      return new Response(JSON.stringify({ skipped: true, reason: "conditions_not_met" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const actions = (workflow.actions as ActionDef[]) || [];
    let hasFailure = false;

    for (const act of actions) {
      try {
        if (act.type === "create_task") {
          const { error } = await supabase.from("agenda_events").insert({
            salesperson_id: trigger_payload.salesperson_id,
            sale_id: trigger_payload.sale_id ?? null,
            title: String(act.params.title ?? "Tarefa automatizada"),
            description: String(act.params.description ?? ""),
            event_type: "task",
            scheduled_at: new Date(Date.now() + Number(act.params.delay_hours ?? 24) * 3600_000).toISOString(),
          });
          if (error) throw error;
          executed.push({ action: act.type, status: "success" });
        } else if (act.type === "log_activity") {
          const { error } = await supabase.from("activities").insert({
            salesperson_id: trigger_payload.salesperson_id,
            sale_id: trigger_payload.sale_id ?? null,
            activity_type: String(act.params.activity_type ?? "note"),
            outcome: "completed",
            notes: String(act.params.notes ?? "Automação executada"),
          });
          if (error) throw error;
          executed.push({ action: act.type, status: "success" });
        } else if (act.type === "update_stage" && trigger_payload.sale_id) {
          const { error } = await supabase
            .from("sales")
            .update({ stage: String(act.params.stage) })
            .eq("id", trigger_payload.sale_id);
          if (error) throw error;
          executed.push({ action: act.type, status: "success" });
        } else {
          executed.push({ action: act.type, status: "skipped", error: "unsupported" });
        }
      } catch (e) {
        hasFailure = true;
        executed.push({ action: act.type, status: "failed", error: String((e as Error).message) });
      }
    }

    const finalStatus = hasFailure ? "partial" : "success";

    await supabase.from("automation_runs").insert({
      workflow_id,
      status: finalStatus,
      trigger_payload,
      actions_executed: executed,
      duration_ms: Date.now() - startedAt,
      completed_at: new Date().toISOString(),
    });

    await supabase
      .from("automation_workflows")
      .update({ run_count: (workflow.run_count ?? 0) + 1, last_run_at: new Date().toISOString() })
      .eq("id", workflow_id);

    return new Response(JSON.stringify({ status: finalStatus, executed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
