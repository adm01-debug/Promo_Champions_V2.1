import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface WorkflowNode {
  id: string;
  type: "trigger" | "condition" | "action";
  data: {
    label: string;
    actionType?: string;
    conditionField?: string;
    conditionOp?: string;
    conditionValue?: string;
    config?: Record<string, unknown>;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
}

interface StepLog {
  nodeId: string;
  label: string;
  status: "ok" | "skipped" | "error";
  detail?: string;
  at: string;
}

const evalCondition = (op: string, left: unknown, right: string): boolean => {
  const l = String(left ?? "").toLowerCase();
  const r = String(right ?? "").toLowerCase();
  const ln = Number(left);
  const rn = Number(right);
  switch (op) {
    case "eq": return l === r;
    case "neq": return l !== r;
    case "contains": return l.includes(r);
    case "gt": return !isNaN(ln) && !isNaN(rn) && ln > rn;
    case "lt": return !isNaN(ln) && !isNaN(rn) && ln < rn;
    default: return false;
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData?.user?.id ?? null;

    const { workflow_id, input_payload = {} } = await req.json();
    if (!workflow_id) {
      return new Response(JSON.stringify({ error: "workflow_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: wf, error: wfErr } = await admin
      .from("workflows")
      .select("*")
      .eq("id", workflow_id)
      .single();

    if (wfErr || !wf) {
      return new Response(JSON.stringify({ error: "Workflow não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!wf.is_active) {
      return new Response(JSON.stringify({ error: "Workflow inativo" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startedAt = Date.now();
    const { data: execRow } = await admin
      .from("workflow_executions")
      .insert({
        workflow_id,
        triggered_by: userId,
        status: "running",
        input_payload,
      })
      .select()
      .single();

    const nodes = (wf.nodes ?? []) as WorkflowNode[];
    const edges = (wf.edges ?? []) as WorkflowEdge[];
    const log: StepLog[] = [];

    const trigger = nodes.find((n) => n.type === "trigger");
    if (!trigger) throw new Error("Workflow sem nó trigger");

    const visited = new Set<string>();
    const queue: string[] = [trigger.id];
    log.push({ nodeId: trigger.id, label: trigger.data.label, status: "ok", detail: "Trigger disparado", at: new Date().toISOString() });

    while (queue.length) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const outgoing = edges.filter((e) => e.source === currentId);
      for (const edge of outgoing) {
        const next = nodes.find((n) => n.id === edge.target);
        if (!next) continue;

        if (next.type === "condition") {
          const left = (input_payload as Record<string, unknown>)[next.data.conditionField ?? ""];
          const passed = evalCondition(next.data.conditionOp ?? "eq", left, next.data.conditionValue ?? "");
          log.push({
            nodeId: next.id,
            label: next.data.label,
            status: passed ? "ok" : "skipped",
            detail: `${next.data.conditionField} ${next.data.conditionOp} ${next.data.conditionValue} → ${passed}`,
            at: new Date().toISOString(),
          });
          if (passed) queue.push(next.id);
        } else if (next.type === "action") {
          log.push({
            nodeId: next.id,
            label: next.data.label,
            status: "ok",
            detail: `Ação ${next.data.actionType ?? "log"} executada (simulado)`,
            at: new Date().toISOString(),
          });
          queue.push(next.id);
        } else {
          queue.push(next.id);
        }
      }
    }

    const duration = Date.now() - startedAt;
    await admin
      .from("workflow_executions")
      .update({
        status: "success",
        step_log: log,
        duration_ms: duration,
        finished_at: new Date().toISOString(),
      })
      .eq("id", execRow!.id);

    await admin
      .from("workflows")
      .update({
        execution_count: (wf.execution_count ?? 0) + 1,
        last_executed_at: new Date().toISOString(),
      })
      .eq("id", workflow_id);

    return new Response(
      JSON.stringify({ execution_id: execRow!.id, status: "success", duration_ms: duration, log }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    console.error("workflow-executor error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
