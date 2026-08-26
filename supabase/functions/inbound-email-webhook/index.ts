import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import {
  createValidationErrorResponse,
  validateWebhookPayload,
  WebhookContracts,
} from "../_shared/webhook-validator.ts";
import { classifySuppression } from "../_shared/unsubscribe.ts";
import { authenticateInboundEmailWebhook } from "../_shared/webhook-auth.ts";
import { readUtf8BodyWithinLimit } from "../_shared/request-body.ts";
import {
  type InboundEmailPayload,
  parseInboundEmailEvents,
  shouldMatchAndPauseEnrollment,
} from "../_shared/webhook-integrity.ts";

const MAX_INBOUND_EMAIL_BODY_BYTES = 256 * 1024;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(withRequestId("inbound-email-webhook", async (req, _ctx) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const rawBody = await readUtf8BodyWithinLimit(
    req,
    MAX_INBOUND_EMAIL_BODY_BYTES,
  );
  if (rawBody === null) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }
  const authentication = await authenticateInboundEmailWebhook(
    req.headers,
    rawBody,
    (name) => Deno.env.get(name),
  );
  if (!authentication.ok) {
    return json(
      { ok: false, error: authentication.code },
      authentication.status,
    );
  }

  let payload: InboundEmailPayload;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || (typeof parsed !== "object")) {
      throw new Error("payload inválido");
    }
    payload = parsed as InboundEmailPayload;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const events = parseInboundEmailEvents(payload, authentication.provider);
  if (events.length === 0) {
    return json({ ok: false, error: "invalid_payload" }, 422);
  }

  // Valida o lote inteiro antes de qualquer escrita. Isso impede que um item
  // inválido deixe o lote parcialmente aceito sem sinalização ao provedor.
  for (const event of events) {
    const validation = validateWebhookPayload(
      WebhookContracts.inboundEmail,
      event,
      "1.1.0",
    );
    if (!validation.success) {
      return createValidationErrorResponse(
        validation.error ?? "Payload inválido",
        validation.details ?? [],
        validation.contract_version,
        corsHeaders,
      );
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ ok: false, error: "server_misconfigured" }, 503);
  }

  const admin = createClient(
    supabaseUrl,
    serviceRoleKey,
  );

  try {
    const matchedEnrollmentIds: string[] = [];
    for (const event of events) {
      let matchedEnrollmentId: string | null = null;
      const affectsEnrollment = shouldMatchAndPauseEnrollment(event.eventType);
      if (affectsEnrollment && event.fromEmail) {
        const { data: matched, error: matchError } = await admin.rpc(
          "match_reply_to_enrollment",
          {
            _contact_email: event.fromEmail,
            _received_at: event.receivedAt,
          },
        );
        if (matchError) throw matchError;
        matchedEnrollmentId = (matched as string | null) ?? null;
      }

      const { error: insertError } = await admin.from("inbound_reply_events")
        .insert({
          provider: event.provider,
          message_id: event.messageId,
          from_email: event.fromEmail,
          subject: event.subject,
          received_at: event.receivedAt,
          event_type: event.eventType,
          matched_enrollment_id: matchedEnrollmentId,
          payload: event.payload as never,
        });
      if (insertError) throw insertError;

      // Supressão automática: hard bounce, reclamação de spam e descadastro do
      // provedor entram na lista de opt-out (soft bounce é preservado).
      const suppression = classifySuppression(event.eventType, event.payload);
      if (suppression && event.fromEmail) {
        const { error: supErr } = await admin.rpc("record_email_opt_out", {
          _email: event.fromEmail,
          _reason: suppression,
          _source: `webhook:${event.provider}`,
          _owner_id: null,
          _metadata: {
            message_id: event.messageId,
            event_type: event.eventType,
          } as never,
        } as never);
        if (supErr) throw supErr;
      }

      if (matchedEnrollmentId && affectsEnrollment) {
        const reason = event.eventType === "bounce"
          ? "bounce"
          : event.eventType === "unsubscribe"
          ? "unsubscribe"
          : event.eventType === "complaint"
          ? "complaint"
          : "reply_detected";
        const { error: pauseError } = await admin.rpc("auto_pause_enrollment", {
          _enrollment_id: matchedEnrollmentId,
          _reason: reason,
        });
        if (pauseError) throw pauseError;
        matchedEnrollmentIds.push(matchedEnrollmentId);
      }
    }

    return json({
      ok: true,
      processed: events.length,
      matched: matchedEnrollmentIds.length,
      event_type: events.length === 1 ? events[0].eventType : undefined,
    });
  } catch (e) {
    console.error("inbound-email-webhook error", e);
    return json({ ok: false, error: "processing_failed" }, 500);
  }
}));
