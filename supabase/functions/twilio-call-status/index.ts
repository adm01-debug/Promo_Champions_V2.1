import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";
import { verifyTwilioSignatureAny } from "../_shared/webhook-auth.ts";
import { readUtf8BodyWithinLimit } from "../_shared/request-body.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

const dispositionMap: Record<string, string> = {
  completed: "connected",
  busy: "busy",
  "no-answer": "no_answer",
  failed: "no_answer",
  canceled: "no_answer",
};

// URLs candidatas para o canonical string da Twilio: a URL efetiva do request
// e a reconstrução determinística via SUPABASE_URL (cobre reescrita de proxy).
// TWILIO_CALL_STATUS_URL permite override explícito, como TWILIO_WEBHOOK_URL
// faz para o multichannel-status-webhook.
function candidateUrls(req: Request): string[] {
  const urls = new Set<string>();
  const override = Deno.env.get("TWILIO_CALL_STATUS_URL");
  if (override) urls.add(override);
  urls.add(req.url);
  const base = Deno.env.get("SUPABASE_URL");
  if (base) {
    const search = new URL(req.url).search;
    urls.add(`${base}/functions/v1/twilio-call-status${search}`);
  }
  return [...urls];
}

Deno.serve(withRequestId("twilio-call-status", async (req, ctx) => {
  const limited = enforceRateLimit(req, {
    name: "twilio-call-status",
    limit: 240,
    windowSeconds: 60,
  });
  if (limited) return limited;

  // Corpo cru ANTES de qualquer parse: a assinatura da Twilio cobre o corpo
  // form-urlencoded byte a byte (padrão do multichannel-status-webhook).
  const rawBody = await readUtf8BodyWithinLimit(req, 64 * 1024);
  if (rawBody === null) {
    return new Response(JSON.stringify({ error: "payload_too_large" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const form = new URLSearchParams(rawBody);
    const callSid = form.get("CallSid");
    if (!callSid) {
      return new Response("Missing CallSid", { status: 400 });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Sessão primeiro: além do update, ela dá o owner e portanto o auth_token
    // do tenant que originou a chamada (credenciais Twilio são por tenant).
    const { data: session, error: sessionErr } = await admin
      .from("twilio_call_sessions")
      .select("*")
      .eq("call_sid", callSid)
      .maybeSingle();
    if (sessionErr) {
      // Falha de banco não pode decidir o caminho de auth (503/401 enganoso) —
      // a Twilio não repete callbacks; 500 sinaliza problema nosso.
      ctx.log("error", "session_lookup_failed", { detail: sessionErr.message });
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    let tenantToken: string | null = null;
    if (session?.owner_id) {
      const { data: cred, error: credErr } = await admin
        .from("channel_credentials")
        .select("credentials")
        .eq("owner_id", session.owner_id)
        .eq("provider", "twilio")
        .eq("enabled", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (credErr) {
        ctx.log("error", "credentials_lookup_failed", { detail: credErr.message });
        return new Response(JSON.stringify({ error: "internal_error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      tenantToken = (cred?.credentials as Record<string, string> | null)?.auth_token ?? null;
    }

    // Tenant tem precedência; global é só fallback (nunca em paralelo — senão
    // vira chave-mestra cross-tenant). Sem token nenhum, cai no 401 genérico
    // abaixo (sem oráculo de configuração); o log diferencia.
    const globalToken = Deno.env.get("TWILIO_AUTH_TOKEN") ?? null;
    const tokens = tenantToken ? [tenantToken] : [globalToken];
    if (!tenantToken && !globalToken) {
      ctx.log("error", "webhook_not_configured", { reason: "no_twilio_auth_token" });
    }

    const signatureOk = await verifyTwilioSignatureAny(
      tokens,
      candidateUrls(req),
      rawBody,
      req.headers.get("content-type") ?? "",
      req.headers.get("x-twilio-signature"),
    );
    if (!signatureOk) {
      ctx.log("warn", "invalid_signature", { call_sid: callSid });
      return new Response(JSON.stringify({ error: "invalid_signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!session) {
      return new Response(JSON.stringify({ error: "unknown_call_sid" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const status = form.get("CallStatus") ?? "";
    const duration = form.get("CallDuration");
    const recordingUrl = form.get("RecordingUrl");
    const recordingSid = form.get("RecordingSid");
    const price = form.get("Price");

    // Callbacks de gravação chegam SEM CallStatus — não sobrescrever o estado
    // real com string vazia.
    const update: Record<string, unknown> = {};
    if (status) update.status = status;
    if (duration) update.duration_seconds = parseInt(duration, 10);
    if (recordingUrl) update.recording_url = `${recordingUrl}.mp3`;
    if (recordingSid) update.recording_sid = recordingSid;
    if (price) update.price = parseFloat(price);
    if (status === "completed" || status === "failed" || status === "canceled" || status === "busy" || status === "no-answer") {
      update.ended_at = new Date().toISOString();
    }

    const { data: updated } = await admin
      .from("twilio_call_sessions")
      .update(update)
      .eq("call_sid", callSid)
      .select()
      .maybeSingle();

    // Auto-create call_log on completion
    if (updated && (status === "completed" || status === "no-answer" || status === "busy" || status === "failed")) {
      const disposition = dispositionMap[status] ?? "no_answer";
      const { data: existing } = await admin
        .from("call_logs")
        .select("id")
        .eq("call_sid", callSid)
        .maybeSingle();

      if (!existing) {
        await admin.from("call_logs").insert({
          owner_id: updated.owner_id,
          sale_id: updated.sale_id,
          queue_item_id: updated.queue_item_id,
          call_sid: callSid,
          disposition,
          duration_seconds: updated.duration_seconds ?? 0,
          notes: status === "completed" ? "Chamada Twilio concluída" : `Chamada Twilio: ${status}`,
        });
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    ctx.log("error", "twilio_call_status_failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}));
