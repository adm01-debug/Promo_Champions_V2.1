import {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { isAuthorizedCronJob } from "../_shared/cron-job-auth.ts";
import {
  backoffMs,
  isPermanentError,
  MAX_RETRIES,
} from "../_shared/retry-policy.ts";

interface Scheduled {
  id: string;
  owner_id: string;
  sale_id: string;
  channel: string;
  payload: unknown;
  status: string;
  attempts: number;
  error: string | null;
  next_retry_at: string | null;
}

interface MultichannelResult {
  ok?: boolean;
  error?: string;
  recorded?: boolean;
}

async function dispatchOne(
  admin: SupabaseClient,
  row: Scheduled,
  nowIso: string,
): Promise<"sent" | "failed" | "retrying" | "claimed_elsewhere"> {
  const { data: claimed, error: claimError } = await admin
    .from("scheduled_sends")
    .update({ status: "processing", error: null })
    .eq("id", row.id)
    .or(
      `and(status.eq.pending),and(status.eq.failed,next_retry_at.lte.${nowIso})`,
    )
    .select("id")
    .maybeSingle();

  if (claimError) throw claimError;
  if (!claimed) return "claimed_elsewhere";

  try {
    // O agendador atual recebe e-mails do Bulk Composer sem o id do rascunho.
    // Não é seguro desviá-los para o envio transacional: isso pularia a
    // supressão, o rodapé e a auditoria próprios do lote.
    if (row.channel === "email") {
      throw new Error("scheduled_email_requires_bulk_draft_contract");
    }
    if (
      !row.payload || typeof row.payload !== "object" ||
      Array.isArray(row.payload)
    ) {
      throw new Error("invalid_scheduled_payload");
    }
    const payload = row.payload as Record<string, unknown>;
    const { data, error } = await admin.functions.invoke(
      "send-multichannel-message",
      {
        body: { ...payload, ownerId: row.owner_id, channel: row.channel },
        headers: { "X-Request-Id": `scheduled_${row.id}` },
      },
    );
    const result = data as MultichannelResult | null;
    if (error || !result?.ok) {
      throw new Error(
        error?.message ?? result?.error ?? "multichannel_send_failed",
      );
    }

    const { error: markSentError } = await admin
      .from("scheduled_sends")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        error: result.recorded === false
          ? "outbound_message_record_failed"
          : null,
      })
      .eq("id", row.id)
      .eq("status", "processing");
    if (markSentError) {
      // O provedor já aceitou a mensagem. Não marcar como falha evita um retry duplicado.
      console.error(
        "process-scheduled-sends unable to persist sent state:",
        markSentError.message,
      );
    }
    return "sent";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!isPermanentError(message) && row.attempts < MAX_RETRIES) {
      const nextAttempt = row.attempts + 1;
      const nextRetryAt = new Date(
        Date.now() + backoffMs(nextAttempt + 1, row.id),
      ).toISOString();
      const { error: markRetryError } = await admin
        .from("scheduled_sends")
        .update({
          status: "failed",
          error: message.slice(0, 500),
          attempts: nextAttempt,
          next_retry_at: nextRetryAt,
        })
        .eq("id", row.id)
        .eq("status", "processing");
      if (markRetryError) {
        console.error(
          "process-scheduled-sends unable to persist retry state:",
          markRetryError.message,
        );
      }
      return "retrying";
    }

    const { error: markFailedError } = await admin
      .from("scheduled_sends")
      .update({
        status: "failed",
        error: message.slice(0, 500),
        attempts: row.attempts + 1,
        next_retry_at: null,
      })
      .eq("id", row.id)
      .eq("status", "processing");
    if (markFailedError) {
      console.error(
        "process-scheduled-sends unable to persist failed state:",
        markFailedError.message,
      );
    }
    return "failed";
  }
}

Deno.serve(withRequestId("process-scheduled-sends", async (req, ctx) => {
  const responseCorsHeaders = getCorsHeaders(req);
  const json = (body: Record<string, unknown>, status = 200): Response => {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
    });
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseCorsHeaders });
  }
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    ctx.log("error", "environment_not_configured");
    return json({ error: "service_not_configured" }, 503);
  }
  if (
    !(await isAuthorizedCronJob(
      req,
      createClient(supabaseUrl, serviceRoleKey),
    ))
  ) {
    return json({ error: "unauthorized" }, 401);
  }

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const nowIso = new Date().toISOString();
    const { data, error } = await admin
      .from("scheduled_sends")
      .select(
        "id, owner_id, sale_id, channel, payload, status, attempts, error, next_retry_at",
      )
      .or(
        `and(status.eq.pending,scheduled_for.lte.${nowIso}),and(status.eq.failed,next_retry_at.lte.${nowIso})`,
      )
      .limit(50);
    if (error) throw error;

    const rows = (data ?? []) as unknown as Scheduled[];
    const queue = [...rows];
    const outcomes: Array<"sent" | "failed" | "retrying" | "claimed_elsewhere"> =
      [];
    const workers = Array.from(
      { length: Math.min(5, queue.length) },
      async () => {
        while (queue.length > 0) {
          const row = queue.shift();
          if (row) outcomes.push(await dispatchOne(admin, row, nowIso));
        }
      },
    );
    await Promise.all(workers);

    return json({
      processed: rows.length,
      sent: outcomes.filter((outcome) => outcome === "sent").length,
      retrying: outcomes.filter((outcome) => outcome === "retrying").length,
      failed: outcomes.filter((outcome) => outcome === "failed").length,
      claimed_elsewhere: outcomes.filter((outcome) =>
        outcome === "claimed_elsewhere"
      ).length,
    });
  } catch (error) {
    ctx.log("error", "processor_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ error: "processor_failed" }, 500);
  }
}));
