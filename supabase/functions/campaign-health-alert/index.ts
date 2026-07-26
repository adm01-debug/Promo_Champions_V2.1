// Alertas automáticos de saúde de campanhas de e-mail em massa.
// Executado por cron/manualmente. Idempotente dentro da janela de cooldown.
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";

import {
  dedupeAlerts,
  evaluateCampaign,
  type CampaignSnapshot,
} from "../_shared/campaign-health.ts";

/** Horas de silêncio entre alertas do mesmo tipo para a mesma campanha. */
const COOLDOWN_HOURS = Number(Deno.env.get("CAMPAIGN_ALERT_COOLDOWN_HOURS") ?? "6") || 6;
/** Janela de campanhas consideradas (dias). */
const LOOKBACK_DAYS = Number(Deno.env.get("CAMPAIGN_ALERT_LOOKBACK_DAYS") ?? "14") || 14;

interface DraftRow {
  job_id: string;
  recipient_email: string | null;
  sent_at: string | null;
  error: string | null;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const since = new Date(Date.now() - LOOKBACK_DAYS * 86400_000).toISOString();

    const { data: jobs, error: jobsError } = await supabase
      .from("email_bulk_jobs")
      .select("id, owner_id, prompt, status, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(200);
    if (jobsError) throw new Error(`jobs: ${jobsError.message}`);
    if (!jobs?.length) return json({ evaluated: 0, created: 0 });

    const jobIds = jobs.map((j) => j.id as string);

    // Rascunhos das campanhas (chunk para não estourar a URL do PostgREST).
    const drafts: DraftRow[] = [];
    for (let i = 0; i < jobIds.length; i += 50) {
      const chunk = jobIds.slice(i, i + 50);
      const { data, error } = await supabase
        .from("email_bulk_drafts")
        .select("job_id, recipient_email, sent_at, error")
        .in("job_id", chunk);
      if (error) throw new Error(`drafts: ${error.message}`);
      drafts.push(...((data ?? []) as DraftRow[]));
    }

    // Opt-outs recentes indexados por e-mail normalizado.
    const { data: optOuts, error: optOutError } = await supabase
      .from("email_opt_outs")
      .select("email, created_at")
      .gte("created_at", since)
      .limit(10000);
    if (optOutError) throw new Error(`opt_outs: ${optOutError.message}`);
    const optOutAt = new Map<string, number>();
    for (const row of optOuts ?? []) {
      const key = String(row.email ?? "").trim().toLowerCase();
      if (!key) continue;
      const ts = Date.parse(String(row.created_at));
      if (!Number.isFinite(ts)) continue;
      const prev = optOutAt.get(key);
      if (prev === undefined || ts < prev) optOutAt.set(key, ts);
    }

    // Agrega métricas por campanha.
    const agg = new Map<
      string,
      { sent: number; failed: number; pending: number; optedOut: number; lastSentAt: number | null }
    >();
    for (const id of jobIds) {
      agg.set(id, { sent: 0, failed: 0, pending: 0, optedOut: 0, lastSentAt: null });
    }
    for (const d of drafts) {
      const bucket = agg.get(d.job_id);
      if (!bucket) continue;
      if (d.sent_at) {
        bucket.sent += 1;
        const ts = Date.parse(d.sent_at);
        if (Number.isFinite(ts) && (bucket.lastSentAt === null || ts > bucket.lastSentAt)) {
          bucket.lastSentAt = ts;
        }
        const email = String(d.recipient_email ?? "").trim().toLowerCase();
        const optTs = email ? optOutAt.get(email) : undefined;
        // Só conta descadastro posterior ao envio (atribuição correta).
        if (optTs !== undefined && Number.isFinite(ts) && optTs >= ts) bucket.optedOut += 1;
      } else if (d.error) {
        bucket.failed += 1;
      } else {
        bucket.pending += 1;
      }
    }

    const now = new Date();
    const candidates = jobs.flatMap((job) => {
      const m = agg.get(job.id as string)!;
      const snapshot: CampaignSnapshot = {
        job_id: job.id as string,
        owner_id: job.owner_id as string,
        prompt: String(job.prompt ?? ""),
        status: String(job.status ?? "draft"),
        created_at: String(job.created_at ?? ""),
        sent_count: m.sent,
        failed_count: m.failed,
        pending_count: m.pending,
        opted_out_count: m.optedOut,
        last_sent_at: m.lastSentAt ? new Date(m.lastSentAt).toISOString() : null,
      };
      return evaluateCampaign(snapshot, now);
    });

    if (candidates.length === 0) return json({ evaluated: jobs.length, created: 0 });

    // Deduplicação por cooldown a partir dos alertas já registrados.
    const cooldownSince = new Date(now.getTime() - COOLDOWN_HOURS * 3600_000).toISOString();
    const { data: recentRows, error: recentError } = await supabase
      .from("campaign_health_alerts")
      .select("job_id, alert_type, created_at")
      .gte("created_at", cooldownSince)
      .limit(5000);
    if (recentError) throw new Error(`recent_alerts: ${recentError.message}`);
    const recent = new Map<string, string>();
    for (const r of recentRows ?? []) {
      recent.set(`${r.job_id}:${r.alert_type}`, String(r.created_at));
    }

    const toInsert = dedupeAlerts(candidates, recent, COOLDOWN_HOURS, now);
    if (toInsert.length === 0) return json({ evaluated: jobs.length, created: 0 });

    const { error: insertError } = await supabase
      .from("campaign_health_alerts")
      .insert(toInsert);
    if (insertError) throw new Error(`insert: ${insertError.message}`);

    // Notifica o dono da campanha (best-effort: falha aqui não invalida o alerta).
    const notifications = toInsert.map((a) => ({
      user_id: a.owner_id,
      title: a.severity === "critical" ? "Campanha em risco" : "Alerta de campanha",
      message: a.message,
      type: a.severity === "critical" ? "error" : "warning",
      category: "system",
      priority: a.severity === "critical" ? "high" : "medium",
      action_url: "/admin/supressao-emails",
      action_label: "Ver campanhas",
      metadata: { job_id: a.job_id, alert_type: a.alert_type, ...a.metrics },
    }));
    const { error: notifyError } = await supabase.from("notifications").insert(notifications);
    if (notifyError) {
      console.error(JSON.stringify({ scope: "campaign-health-alert", notifyError: notifyError.message }));
    }

    return json({ evaluated: jobs.length, created: toInsert.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(JSON.stringify({ scope: "campaign-health-alert", error: message }));
    return json({ error: message }, 500);
  }
});
