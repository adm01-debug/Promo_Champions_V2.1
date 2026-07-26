// Cron Failure Alerter — G2
// Runs periodically (via pg_cron), scans cron.job_run_details for failures in the
// last N minutes and creates admin notifications (deduped by (jobid, start_time)).
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";
import { getCorsHeaders(req), getCorsHeaders } from "../_shared/cors.ts";
import { validateNotificationBatch } from "../_shared/notification-categories.ts";

interface CronFailure {
  jobid: number;
  jobname: string | null;
  status: string;
  return_message: string | null;
  start_time: string;
  end_time: string | null;
}

Deno.serve(withRequestId("cron-failure-alerter", async (req, ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  const { requestId, log } = ctx;

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
        headers: { getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const rows = (failures ?? []) as CronFailure[];
    if (rows.length === 0) {
      log("info", "no new cron failures", { sinceMinutes });
      return new Response(
        JSON.stringify({ ok: true, failures: 0, notified: 0, requestId }),
        { headers: { getCorsHeaders(req), "Content-Type": "application/json" } },
      );
    }

    // Load admin user_ids (bounded — admins are a small set)
    const { data: admins, error: aErr } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(100);

    if (aErr) {
      log("error", "failed loading admins", { error: aErr.message });
      return new Response(JSON.stringify({ error: aErr.message, requestId }), {
        status: 500,
        headers: { getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const adminIds = (admins ?? []).map((r) => r.user_id as string);

    // Build ALL notification rows across ALL failures in one pass — no DB calls inside loop
    const allNotifRows: Array<Record<string, unknown>> = [];
    for (const f of rows) {
      if (adminIds.length === 0) continue;
      const jobLabel = f.jobname ?? `job#${f.jobid}`;
      for (const uid of adminIds) {
        allNotifRows.push({
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
        });
      }
    }

    // Single batch insert for all notifications — valida antes para pegar
    // categoria/prioridade inválida em runtime com mensagem clara.
    let notifiedTotal = 0;
    if (allNotifRows.length > 0) {
      const validated = validateNotificationBatch(allNotifRows);
      const { error: nErr } = await admin.from("notifications").insert(validated);
      if (nErr) {
        log("error", "batch insert notifications failed", { error: nErr.message });
        // Don't mark alerted — let next tick retry
        return new Response(JSON.stringify({ error: nErr.message, requestId }), {
          status: 500,
          headers: { getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      notifiedTotal = validated.length;
    }

    // Mark all failures as alerted in parallel — N parallel RPCs instead of sequential
    const markResults = await Promise.all(
      rows.map((f) =>
        admin.rpc("fn_admin_mark_cron_failure_alerted", {
          _jobid: f.jobid,
          _jobname: f.jobname,
          _start_time: f.start_time,
          _status: f.status,
          _return_message: f.return_message,
          _notified_admin_count: adminIds.length,
        })
      )
    );
    for (let i = 0; i < rows.length; i++) {
      const mErr = markResults[i].error;
      if (mErr) log("error", "mark alerted failed", { error: mErr.message, jobid: rows[i].jobid });
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
      { headers: { getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error('cron-failure-alerter error:', e);
    const msg = e instanceof Error ? e.message : String(e);
    log("error", "unhandled", { error: msg });
    return new Response(JSON.stringify({ error: msg, requestId }), {
      status: 500,
      headers: { getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
}));
