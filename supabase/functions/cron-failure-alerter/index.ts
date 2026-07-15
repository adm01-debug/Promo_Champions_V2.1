// Cron Failure Alerter — G2
// Runs periodically (via pg_cron), scans cron.job_run_details for failures in the
// last N minutes and creates admin notifications (deduped by (jobid, start_time)).
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CronFailure {
  jobid: number;
  jobname: string | null;
  status: string;
  return_message: string | null;
  start_time: string;
  end_time: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const requestId = crypto.randomUUID();
  const log = (level: string, msg: string, extra: Record<string, unknown> = {}) =>
    console.log(JSON.stringify({ level, requestId, fn: "cron-failure-alerter", msg, ...extra }));

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const url = new URL(req.url);
    const sinceMinutes = Math.min(
      Math.max(parseInt(url.searchParams.get("since_minutes") ?? "30", 10) || 30, 5),
      1440,
    );

    // Fetch new (un-alerted) failures via SECURITY DEFINER RPC (service_role bypasses admin check).
    const { data: failures, error: fErr } = await admin.rpc("fn_admin_get_new_cron_failures", {
      _since_minutes: sinceMinutes,
    });

    if (fErr) {
      log("error", "rpc fn_admin_get_new_cron_failures failed", { error: fErr.message });
      return new Response(JSON.stringify({ error: fErr.message, requestId }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = (failures ?? []) as CronFailure[];
    if (rows.length === 0) {
      log("info", "no new cron failures", { sinceMinutes });
      return new Response(
        JSON.stringify({ ok: true, failures: 0, notified: 0, requestId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Load admin user_ids
    const { data: admins, error: aErr } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (aErr) {
      log("error", "failed loading admins", { error: aErr.message });
      return new Response(JSON.stringify({ error: aErr.message, requestId }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminIds = (admins ?? []).map((r) => r.user_id as string);
    let notifiedTotal = 0;

    for (const f of rows) {
      // Build one notification per admin per failure.
      if (adminIds.length > 0) {
        const jobLabel = f.jobname ?? `job#${f.jobid}`;
        const payload = adminIds.map((uid) => ({
          user_id: uid,
          type: "system",
          category: "system",
          priority: "high",
          title: `Cron falhou: ${jobLabel}`,
          message: (f.return_message ?? f.status).slice(0, 400),
          icon: "alert-triangle",
          action_url: "/admin/conexoes",
          action_label: "Ver painel",
          metadata: {
            jobid: f.jobid,
            jobname: f.jobname,
            status: f.status,
            start_time: f.start_time,
            end_time: f.end_time,
            source: "cron-failure-alerter",
          },
        }));

        const { error: nErr } = await admin.from("notifications").insert(payload);
        if (nErr) {
          log("error", "insert notifications failed", { error: nErr.message, jobid: f.jobid });
          continue; // don't mark alerted so it retries next tick
        }
        notifiedTotal += payload.length;
      }

      // Mark this (jobid, start_time) as alerted so we don't spam next tick.
      const { error: mErr } = await admin.rpc("fn_admin_mark_cron_failure_alerted", {
        _jobid: f.jobid,
        _jobname: f.jobname,
        _start_time: f.start_time,
        _status: f.status,
        _return_message: f.return_message,
        _notified_admin_count: adminIds.length,
      });
      if (mErr) {
        log("error", "mark alerted failed", { error: mErr.message, jobid: f.jobid });
      }
    }

    log("info", "processed cron failures", {
      failures: rows.length,
      notified: notifiedTotal,
      admins: adminIds.length,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        failures: rows.length,
        notified: notifiedTotal,
        admins: adminIds.length,
        requestId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("error", "unhandled", { error: msg });
    return new Response(JSON.stringify({ error: msg, requestId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
