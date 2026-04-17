import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Enrollment {
  id: string;
  sequence_id: string;
  contact_id: string;
  contact_type: string;
  current_step: number;
  status: string;
}

interface Step {
  id: string;
  sequence_id: string;
  step_order: number;
  channel: string;
  delay_days: number;
  delay_hours: number;
  subject: string | null;
  body: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const startedAt = Date.now();
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    const { data: due, error: dueErr } = await supabase
      .from("sequence_enrollments")
      .select("id, sequence_id, contact_id, contact_type, current_step, status")
      .eq("status", "active")
      .lte("next_action_at", new Date().toISOString())
      .limit(50);

    if (dueErr) throw dueErr;

    for (const enr of (due ?? []) as Enrollment[]) {
      processed++;
      try {
        const { data: steps, error: stepsErr } = await supabase
          .from("sequence_steps")
          .select("*")
          .eq("sequence_id", enr.sequence_id)
          .order("step_order", { ascending: true });

        if (stepsErr) throw stepsErr;
        const stepList = (steps ?? []) as Step[];

        const nextStep = stepList[enr.current_step];

        if (!nextStep) {
          await supabase
            .from("sequence_enrollments")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              next_action_at: null,
            })
            .eq("id", enr.id);
          succeeded++;
          continue;
        }

        // Record execution (channel-agnostic stub — real send wiring per channel happens in 2/7+)
        await supabase.from("sequence_step_executions").insert({
          enrollment_id: enr.id,
          step_id: nextStep.id,
          status: "sent",
          channel: nextStep.channel,
          engagement: { auto: true, dispatched_at: new Date().toISOString() },
        });

        // Compute next step delay
        const upcomingIdx = enr.current_step + 1;
        const upcoming = stepList[upcomingIdx];
        let nextActionAt: string | null = null;
        let newStatus = enr.status;
        let completedAt: string | null = null;

        if (upcoming) {
          const delayMs =
            (upcoming.delay_days * 24 + upcoming.delay_hours) * 3600 * 1000;
          nextActionAt = new Date(Date.now() + delayMs).toISOString();
        } else {
          newStatus = "completed";
          completedAt = new Date().toISOString();
        }

        await supabase
          .from("sequence_enrollments")
          .update({
            current_step: upcomingIdx,
            last_executed_at: new Date().toISOString(),
            next_action_at: nextActionAt,
            status: newStatus,
            completed_at: completedAt,
          })
          .eq("id", enr.id);

        succeeded++;
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`enrollment ${enr.id}: ${msg}`);
        await supabase.from("sequence_step_executions").insert({
          enrollment_id: enr.id,
          step_id: "00000000-0000-0000-0000-000000000000",
          status: "failed",
          error_message: msg,
        }).select().maybeSingle().then(() => undefined).catch(() => undefined);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed,
        succeeded,
        failed,
        duration_ms: Date.now() - startedAt,
        errors: errors.slice(0, 10),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
