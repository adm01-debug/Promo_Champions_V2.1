import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";

Deno.serve(withRequestId("process-cadence-tasks", async (req, _ctx) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const today = new Date().toISOString().split("T")[0];

    // ── Atomic claim: flip status → 'processing' in a single UPDATE, return
    //    only the rows WE changed. This prevents duplicate sends when two
    //    invocations race (CWE-362).
    //    The WHERE also filters by prospect_cadences.status = 'active'
    //    so paused/cancelled cadences are never executed (CRITICAL #5 fix).
    const { data: claimedIds, error: claimErr } = await supabase.rpc(
      "claim_pending_cadence_tasks",
      { p_today: today, p_limit: 20 },
    );

    if (claimErr) throw claimErr;

    if (!claimedIds || claimedIds.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Fetch full task data for the claimed IDs only
    const tasks = await chunkedIn<Record<string, unknown>>(
      claimedIds,
      (chunk) => supabase
        .from("cadence_tasks")
        .select(`
          *,
          cadence_step:cadence_steps(*),
          prospect_cadence:prospect_cadences(
            *,
            sale:sales(*, client:clients(*))
          )
        `)
        .in("id", chunk),
      { parallel: true, label: "process-cadence-tasks.tasks" },
    );

    const results = [];
    const now = new Date().toISOString();

    interface TaskOutcome {
      id: string;
      status: "completed" | "failed" | "skipped";
      notes: string;
    }
    const taskOutcomes: TaskOutcome[] = [];

    // Phase 1: sequential external calls (email/whatsapp ordering + rate limits)
    for (const task of tasks || []) {
      const step = task.cadence_step;
      const prospectCadence = task.prospect_cadence;
      const sale = prospectCadence?.sale;
      const client = sale?.client;

      // Guard: only proceed if the cadence is still active
      // (status could have changed between claim and fetch)
      if (prospectCadence?.status !== "active") {
        taskOutcomes.push({ id: task.id, status: "skipped", notes: "Cadence is not active." });
        results.push({ task_id: task.id, status: "skipped", reason: "cadence_inactive" });
        continue;
      }

      if (!client || !step) {
        taskOutcomes.push({ id: task.id, status: "failed", notes: "Missing client or step info." });
        results.push({ task_id: task.id, status: "error", error: "Missing client or step info" });
        continue;
      }

      try {
        let sent = false;
        let sendError: unknown = null;

        if (step.action_type === "email") {
          const { error: emailErr } = await supabase.functions.invoke("email-bulk-send", {
            body: {
              to: client.email,
              subject: step.title,
              body: step.template_content,
              sale_id: sale.id,
            },
          });
          if (!emailErr) sent = true;
          else sendError = emailErr;
        } else if (step.action_type === "whatsapp" && client.phone) {
          const { error: waErr } = await supabase.functions.invoke("send-multichannel-message", {
            body: {
              ownerId: sale.salesperson_id,
              channel: "whatsapp",
              to: client.phone,
              body: step.template_content,
              saleId: sale.id,
            },
          });
          if (!waErr) sent = true;
          else sendError = waErr;
        } else {
          // No action for this step type / missing phone — mark as skipped
          taskOutcomes.push({ id: task.id, status: "skipped", notes: "No eligible action for step type." });
          results.push({ task_id: task.id, status: "skipped" });
          continue;
        }

        if (sent) {
          taskOutcomes.push({ id: task.id, status: "completed", notes: "Executado automaticamente pelo motor de cadência." });
          results.push({ task_id: task.id, status: "success" });
        } else {
          taskOutcomes.push({ id: task.id, status: "failed", notes: String(sendError) });
          results.push({
            task_id: task.id,
            status: "failed",
            error: sendError instanceof Error ? sendError.message : "Send failed",
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        taskOutcomes.push({ id: task.id, status: "failed", notes: msg });
        results.push({ task_id: task.id, status: "error", error: msg });
      }
    }

    // Phase 2: batch DB updates — parallelize all task status writes
    const completedIds = taskOutcomes.filter(o => o.status === "completed").map(o => o.id);
    const nonCompletedOps = taskOutcomes.filter(o => o.status !== "completed");
    await Promise.all([
      completedIds.length > 0
        ? chunkedIn<{ id: string }>(
            completedIds,
            (chunk) => supabase.from("cadence_tasks").update({
              status: "completed",
              completed_at: now,
              notes: "Executado automaticamente pelo motor de cadência.",
            }).in("id", chunk).select("id"),
            { parallel: false, label: "process-cadence-tasks.update-completed" },
          )
        : Promise.resolve([]),
      ...nonCompletedOps.map(o =>
        supabase.from("cadence_tasks").update({ status: o.status, notes: o.notes }).eq("id", o.id)
      ),
    ]);

    return new Response(
      JSON.stringify({ ok: true, processed: tasks.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error('process-cadence-tasks error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
}));
