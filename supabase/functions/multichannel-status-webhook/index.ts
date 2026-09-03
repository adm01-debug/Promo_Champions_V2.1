import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import {
  authenticateMultichannelStatusWebhook,
  verifyMetaWebhookHandshake,
} from "../_shared/webhook-auth.ts";
import { readUtf8BodyWithinLimit } from "../_shared/request-body.ts";
import {
  type NormalizedMessageStatus,
  previousStatusesFor,
} from "../_shared/webhook-integrity.ts";

interface ParsedStatusEvent {
  providerMessageId: string | null;
  status: string | null;
}

const MAX_MULTICHANNEL_STATUS_BODY_BYTES = 256 * 1024;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Faz o parse somente depois de validar a assinatura sobre o corpo bruto. */
export function parseMultichannelStatusPayload(
  rawBody: string,
  contentType: string,
): ParsedStatusEvent {
  if (contentType.toLowerCase().includes("application/json")) {
    const value: unknown = JSON.parse(rawBody);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("payload JSON inválido");
    }
    const payload = value as {
      entry?: Array<
        {
          changes?: Array<
            { value?: { statuses?: Array<{ id?: unknown; status?: unknown }> } }
          >;
        }
      >;
      messageId?: unknown;
      id?: unknown;
      status?: unknown;
    };
    const metaStatus = payload.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
    if (metaStatus?.id) {
      return {
        providerMessageId: asString(metaStatus.id),
        status: asString(metaStatus.status),
      };
    }
    return {
      providerMessageId: asString(payload.messageId) ?? asString(payload.id),
      status: asString(payload.status),
    };
  }

  const form = new URLSearchParams(rawBody);
  return {
    providerMessageId: form.get("MessageSid"),
    status: form.get("MessageStatus"),
  };
}

export function normalizeMessageStatus(
  status: string | null,
): NormalizedMessageStatus | null {
  if (!status) return null;
  const normalized = status.toLowerCase();
  if (normalized === "delivered") return "delivered";
  if (["read", "seen"].includes(normalized)) return "read";
  if (["failed", "undelivered", "error"].includes(normalized)) return "failed";
  if (["sent", "queued", "accepted"].includes(normalized)) return "sent";
  return null;
}

// Webhook público para Twilio / Meta Cloud / Z-API.
// Cada callback precisa ser autenticado antes de acessar o banco com service_role.
Deno.serve(withRequestId("multichannel-status-webhook", async (req, _ctx) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method === "GET") {
    const url = new URL(req.url);
    const handshake = verifyMetaWebhookHandshake(
      url,
      (name) => Deno.env.get(name),
    );
    if (!handshake.ok) {
      return json({ ok: false, error: handshake.code }, handshake.status);
    }
    return new Response(url.searchParams.get("hub.challenge")!, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  // Proteção de volume antes do trabalho de HMAC/parse (assinatura já barra
  // conteúdo forjado; isto barra flood).
  const limited = enforceRateLimit(req, {
    name: "multichannel-status-webhook",
    limit: 300,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const rawBody = await readUtf8BodyWithinLimit(
    req,
    MAX_MULTICHANNEL_STATUS_BODY_BYTES,
  );
  if (rawBody === null) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }
  const authentication = await authenticateMultichannelStatusWebhook(
    req.headers,
    rawBody,
    req.url,
    (name) => Deno.env.get(name),
  );
  if (!authentication.ok) {
    return json(
      { ok: false, error: authentication.code },
      authentication.status,
    );
  }

  let event: ParsedStatusEvent;
  try {
    event = parseMultichannelStatusPayload(
      rawBody,
      req.headers.get("content-type") ?? "",
    );
  } catch {
    return json({ ok: false, error: "invalid_payload" }, 400);
  }

  const normalized = normalizeMessageStatus(event.status);
  if (!event.providerMessageId || !normalized) {
    return json({ ok: true, ignored: true });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ ok: false, error: "server_misconfigured" }, 503);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: msg, error: lookupError } = await supabase
      .from("outbound_messages")
      .select("id, enrollment_id")
      .eq("provider_message_id", event.providerMessageId)
      .maybeSingle();
    if (lookupError) throw lookupError;

    if (!msg) {
      return json({ ok: true, ignored: true, reason: "message_not_found" });
    }

    const occurredAt = new Date().toISOString();
    const update: Record<string, unknown> = { status: normalized };
    if (normalized === "delivered") update.delivered_at = occurredAt;
    if (normalized === "read") update.read_at = occurredAt;

    // O predicado de estado é um compare-and-swap: callbacks atrasados não
    // regredem o estado, e dois replays de `read` não chegam ao engajamento.
    const { data: advanced, error: updateError } = await supabase
      .from("outbound_messages")
      .update(update)
      .eq("id", msg.id)
      .in("status", previousStatusesFor(normalized))
      .select("id, enrollment_id");
    if (updateError) throw updateError;

    const advancedMessage = advanced?.[0];
    if (!advancedMessage) {
      return json({ ok: true, ignored: true, reason: "stale_or_replayed" });
    }

    // Só quem ganhou o compare-and-swap de read registra a abertura.
    if (normalized === "read" && advancedMessage.enrollment_id) {
      const { data: enr, error: enrollmentError } = await supabase
        .from("sequence_enrollments")
        .select("contact_id, contact_type")
        .eq("id", advancedMessage.enrollment_id)
        .maybeSingle();
      if (enrollmentError) throw enrollmentError;
      if (enr?.contact_id && enr?.contact_type) {
        const { error: engagementError } = await supabase.rpc(
          "record_engagement_signal",
          {
            _contact_id: enr.contact_id,
            _contact_type: enr.contact_type,
            _signal: "open",
            _occurred_at: occurredAt,
          },
        );
        if (engagementError) throw engagementError;
      }
    }

    return json({ ok: true });
  } catch (error) {
    console.error("multichannel-status-webhook error", error);
    return json({ ok: false, error: "processing_failed" }, 500);
  }
}));
