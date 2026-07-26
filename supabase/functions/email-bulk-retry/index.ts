import { createClient } from "npm:@supabase/supabase-js@2.49.4";

import { getCorsHeaders } from "../_shared/cors.ts";
import { decideRetry, type RetryableDraft } from "../_shared/retry-policy.ts";
import { filterOptedOut, unsubscribeFooterHtml, unsubscribeHeaders } from "../_shared/unsubscribe.ts";
import { resolveThrottle, SendPacer } from "../_shared/send-pacer.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/** Teto de rascunhos avaliados por execução — protege o tempo de resposta. */
const SCAN_LIMIT = 500;

interface DraftRow extends RetryableDraft {
  job_id: string;
  recipient_email: string | null;
  subject: string;
  body: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const now = new Date();

    // Só rascunhos aprovados, não enviados e com erro registrado interessam.
    const { data: rows, error: readError } = await admin
      .from("email_bulk_drafts")
      .select(
        "id, job_id, recipient_email, subject, body, error, retry_count, sent_at, next_retry_at",
      )
      .is("sent_at", null)
      .eq("approved", true)
      .not("error", "is", null)
      .order("last_error_at", { ascending: true, nullsFirst: true })
      .limit(SCAN_LIMIT);

    if (readError) throw new Error(readError.message);

    const drafts = (rows ?? []) as DraftRow[];
    if (drafts.length === 0) {
      return json({ scanned: 0, retried: 0, gaveUp: 0, skipped: 0, failed: 0 });
    }

    // Guarda de opt-out reavaliada a cada rodada: a supressão pode ter mudado.
    const { allowed, blocked } = await filterOptedOut(
      admin as never,
      drafts,
      (d) => d.recipient_email ?? "",
    );
    const allowedIds = new Set(allowed.map((d) => d.id));

    let retried = 0;
    let gaveUp = 0;
    let skipped = 0;
    let failed = 0;

    for (const d of blocked) {
      await admin
        .from("email_bulk_drafts")
        .update({ error: "opted_out", next_retry_at: null, last_error_at: now.toISOString() })
        .eq("id", d.id);
      gaveUp++;
    }

    // Remetente resolvido uma única vez; sem ele o reprocessamento é abortado.
    let fromAddress = Deno.env.get("BULK_EMAIL_FROM") ?? "";
    if (!fromAddress) {
      const { data: s } = await admin
        .from("churn_alert_settings")
        .select("email_from")
        .maybeSingle();
      fromAddress = (s as { email_from?: string } | null)?.email_from ?? "";
    }
    if (!fromAddress) {
      return json({ error: "sender_not_configured", scanned: drafts.length }, 400);
    }

    const pacer = new SendPacer(resolveThrottle((k) => Deno.env.get(k) ?? undefined));

    for (const d of drafts) {
      if (!allowedIds.has(d.id)) continue;

      const decision = decideRetry(d, now);
      if (decision.action === "skip") {
        skipped++;
        continue;
      }
      if (decision.action === "give_up") {
        await admin
          .from("email_bulk_drafts")
          .update({ next_retry_at: null, last_error_at: now.toISOString() })
          .eq("id", d.id);
        gaveUp++;
        continue;
      }

      if (!d.recipient_email) {
        await admin
          .from("email_bulk_drafts")
          .update({ error: "missing_recipient_email", next_retry_at: null })
          .eq("id", d.id);
        gaveUp++;
        continue;
      }

      try {
        const footer = await unsubscribeFooterHtml(d.recipient_email);
        const headers = await unsubscribeHeaders(d.recipient_email);

        const { error } = await admin.rpc("enqueue_email", {
          p_to: [d.recipient_email],
          p_from: fromAddress,
          p_reply_to: null,
          p_subject: d.subject,
          p_html: `${d.body ?? ""}${footer}`,
          p_purpose: "transactional",
          p_template_name: "bulk-composer-retry",
          p_headers: headers,
        } as never);
        if (error) throw new Error(error.message);

        await admin
          .from("email_bulk_drafts")
          .update({
            sent_at: new Date().toISOString(),
            error: null,
            next_retry_at: null,
            retry_count: decision.attempt,
          })
          .eq("id", d.id);
        retried++;
        await pacer.afterSend();
      } catch (e) {
        const msg = (e as Error).message ?? String(e);
        await admin
          .from("email_bulk_drafts")
          .update({
            error: msg.slice(0, 500),
            retry_count: decision.attempt,
            next_retry_at: decision.nextRetryAt,
            last_error_at: new Date().toISOString(),
          })
          .eq("id", d.id);
        failed++;
      }
    }

    return json({ scanned: drafts.length, retried, gaveUp, skipped, failed });
  } catch (e) {
    console.error("email-bulk-retry error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
