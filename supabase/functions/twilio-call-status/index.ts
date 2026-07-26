import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";

const dispositionMap: Record<string, string> = {
  completed: "connected",
  busy: "busy",
  "no-answer": "no_answer",
  failed: "no_answer",
  canceled: "no_answer",
};

/**
 * Valida assinatura HMAC-SHA1 do webhook Twilio.
 * Twilio usa: Base64(HMAC-SHA1(url + body, auth_token))
 * Header: X-Twilio-Signature
 */
async function validateTwilioSignature(
  url: string,
  params: URLSearchParams,
  signature: string,
): Promise<boolean> {
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!authToken) {
    // TWILIO_AUTH_TOKEN não configurado — rejeitar em produção
    console.warn("[twilio-call-status] TWILIO_AUTH_TOKEN não configurado — rejeitando webhook");
    return false;
  }

  // Twilio valida: GET params + full URL (sem protocolo, só path+query)
  const data = url + params.toString();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const expected = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return timingSafeEqual(signature, expected);
}

/** Constant-time comparison para prevenir timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  const ua = new TextEncoder().encode(a);
  const ub = new TextEncoder().encode(b);
  for (let i = 0; i < ua.byteLength; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

Deno.serve(withRequestId("twilio-call-status", async (req, _ctx) => {
  try {
    const url = new URL(req.url);
    // Twilio envia POST application/x-www-form-urlencoded
    const form = await req.formData();
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      params.set(key, value as string);
    }
    const callSid = params.get("CallSid") as string;
    const status = params.get("CallStatus") as string;

    if (!callSid) {
      return new Response("Missing CallSid", { status: 400 });
    }

    // ── S1: HMAC Signature Validation (CRITICAL security fix) ──────────────
    const twilioSignature = req.headers.get("x-twilio-signature") ?? "";
    const webhookUrl = `${url.origin}${url.pathname}`;
    const isValid = await validateTwilioSignature(webhookUrl, params, twilioSignature);

    if (!isValid) {
      console.warn("[twilio-call-status] Assinatura Twilio inválida — rejeitando request");
      return new Response("Unauthorized", { status: 401 });
    }

    // ── S2: Basic rate-limit via webhook_dedupe ────────────────────────────
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: dedupe } = await admin
      .from("webhook_inbound_dedupe")
      .select("id")
      .eq("event_id", `twilio:${callSid}:${status}`)
      .maybeSingle();

    if (dedupe) {
      // Callback duplicado — ignorar silenciosamente
      return new Response("ok (duplicate)", { status: 200 });
    }

    // Registrar dedupe key
    await admin.from("webhook_inbound_dedupe").insert({
      event_id: `twilio:${callSid}:${status}`,
      provider: "twilio",
      processed_at: new Date().toISOString(),
    });

    const duration = params.get("CallDuration");
    const recordingUrl = params.get("RecordingUrl");
    const recordingSid = params.get("RecordingSid");
    const price = params.get("Price");

    const update: Record<string, unknown> = { status };
    if (duration) update.duration_seconds = parseInt(duration, 10);
    if (recordingUrl) update.recording_url = `${recordingUrl}.mp3`;
    if (recordingSid) update.recording_sid = recordingSid;
    if (price) update.price = parseFloat(price);
    if (["completed", "failed", "canceled", "busy", "no-answer"].includes(status)) {
      update.ended_at = new Date().toISOString();
    }

    const { data: session } = await admin
      .from("twilio_call_sessions")
      .update(update)
      .eq("call_sid", callSid)
      .select()
      .maybeSingle();

    if (session && ["completed", "no-answer", "busy", "failed"].includes(status)) {
      const disposition = dispositionMap[status] ?? "no_answer";
      const { data: existing } = await admin
        .from("call_logs")
        .select("id")
        .eq("call_sid", callSid)
        .maybeSingle();

      if (!existing) {
        await admin.from("call_logs").insert({
          owner_id: session.owner_id,
          sale_id: session.sale_id,
          queue_item_id: session.queue_item_id,
          call_sid: callSid,
          disposition,
          duration_seconds: session.duration_seconds ?? 0,
          notes: status === "completed" ? "Chamada Twilio concluída" : `Chamada Twilio: ${status}`,
        });
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("twilio-call-status error:", e);
    return new Response((e as Error).message, { status: 500 });
  }
}));
