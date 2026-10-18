import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { chunkedIn } from "../_shared/chunked-in.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import {
  timingSafeEqual,
  verifyHmacSha256Signature,
} from "../_shared/webhook-auth.ts";
import { readUtf8BodyWithinLimit } from "../_shared/request-body.ts";
import {
  collectErrors,
  validateString,
  validationErrorResponse,
} from "../_shared/validation.ts";
import {
  type NormalizedMessageStatus,
  previousStatusesFor,
} from "../_shared/webhook-integrity.ts";

// Webhook público da Evolution API (instância wpp2 na VPS): ingere respostas
// recebidas (messages.upsert) e acks de status (messages.update). Sem JWT —
// autenticação por segredo compartilhado, como nos demais webhooks do repo.
//
// Verificação (qualquer uma serve, configurável no webhook da Evolution):
//   - x-webhook-signature: HMAC-SHA256 hex do corpo bruto
//   - x-webhook-secret: valor bruto de WHATSAPP_INBOUND_WEBHOOK_SECRET

const MAX_BODY_BYTES = 256 * 1024;
const MAX_INBOUND_TEXT = 4_096;

interface EvolutionKey {
  remoteJid?: unknown;
  fromMe?: unknown;
  id?: unknown;
}

interface EvolutionEvent {
  event?: unknown;
  instance?: unknown;
  data?: unknown;
}

interface InboundMessage {
  providerMessageId: string;
  fromPhone: string;
  pushName: string | null;
  text: string;
  messageType: string;
  messageTimestamp: number | null;
  raw: unknown;
}

interface StatusAck {
  providerMessageId: string;
  status: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** `55119...@s.whatsapp.net` / `...@lid` / `...@g.us` → domínio + dígitos. */
function jidToPhone(remoteJid: string | null): {
  phone: string;
  isGroup: boolean;
} | null {
  if (!remoteJid) return null;
  const at = remoteJid.indexOf("@");
  if (at <= 0) return null;
  const domain = remoteJid.slice(at + 1);
  const phone = remoteJid.slice(0, at).replace(/\D/g, "");
  if (!phone) return null;
  return { phone, isGroup: domain === "g.us" };
}

function extractText(message: Record<string, unknown>): {
  text: string;
  messageType: string;
} {
  const type = Object.keys(message)[0] ?? "unknown";
  const conversation = asString(message.conversation);
  if (conversation) return { text: conversation, messageType: "conversation" };

  const extended = message.extendedTextMessage as
    | { text?: unknown }
    | undefined;
  const extendedText = asString(extended?.text);
  if (extendedText) {
    return { text: extendedText, messageType: "extendedTextMessage" };
  }

  // Mídia e outros tipos chegam sem texto legível — registra o tipo no lugar.
  return { text: `[${type}]`, messageType: type };
}

function parseInboundMessage(event: EvolutionEvent): InboundMessage | null {
  const data = event.data as
    | { key?: EvolutionKey; pushName?: unknown; message?: unknown; messageTimestamp?: unknown }
    | undefined;
  const key = data?.key;
  if (!key || key.fromMe !== false) return null;

  const providerMessageId = asString(key.id);
  const jid = jidToPhone(asString(key.remoteJid));
  if (!providerMessageId || !jid || jid.isGroup) return null;

  const message = data?.message;
  const { text, messageType } =
    message && typeof message === "object" && !Array.isArray(message)
      ? extractText(message as Record<string, unknown>)
      : { text: "", messageType: "unknown" };

  const ts = data?.messageTimestamp;
  return {
    providerMessageId,
    fromPhone: jid.phone,
    pushName: asString(data?.pushName),
    text: text.slice(0, MAX_INBOUND_TEXT),
    messageType,
    messageTimestamp: typeof ts === "number" ? ts : null,
    raw: data,
  };
}

function parseStatusAck(event: EvolutionEvent): StatusAck[] {
  const items = Array.isArray(event.data) ? event.data : [event.data];
  const acks: StatusAck[] = [];
  for (const item of items) {
    const data = item as {
      key?: EvolutionKey;
      update?: { status?: unknown };
      status?: unknown;
      // Evolution v2 envia messages.update FLAT: {keyId, remoteJid, fromMe,
      // status} — sem o envelope `key`/`update` do formato aninhado.
      keyId?: unknown;
      fromMe?: unknown;
    } | null;
    const key = data?.key;
    const providerMessageId = asString(key?.id) ?? asString(data?.keyId);
    const fromMe = key?.fromMe === true || data?.fromMe === true;
    if (!fromMe) continue;
    const status = asString(data?.update?.status) ?? asString(data?.status);
    if (providerMessageId && status) {
      acks.push({ providerMessageId, status });
    }
  }
  return acks;
}

function normalizeAckStatus(status: string): NormalizedMessageStatus | null {
  switch (status.toUpperCase()) {
    case "READ":
      return "read";
    case "DELIVERY_ACK":
    case "PLAYED":
      return "delivered";
    case "ERROR":
      return "failed";
    case "SERVER_ACK":
    case "PENDING":
      return "sent";
    default:
      return null;
  }
}

async function authenticate(
  req: Request,
  rawBody: string,
): Promise<{ ok: true } | { ok: false; status: number; code: string }> {
  const secret = Deno.env.get("WHATSAPP_INBOUND_WEBHOOK_SECRET");
  const signature = req.headers.get("x-webhook-signature");
  const sharedSecret = req.headers.get("x-webhook-secret");

  if (!signature && !sharedSecret) {
    return { ok: false, status: 401, code: "signature_missing" };
  }
  if (!secret) {
    return { ok: false, status: 503, code: "webhook_not_configured" };
  }

  if (signature) {
    return (await verifyHmacSha256Signature(secret, rawBody, signature))
      ? { ok: true }
      : { ok: false, status: 401, code: "invalid_signature" };
  }
  return timingSafeEqual(sharedSecret!, secret)
    ? { ok: true }
    : { ok: false, status: 401, code: "invalid_signature" };
}

Deno.serve(
  withRequestId("whatsapp-inbound-webhook", async (req, ctx) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (req.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405);
    }

    const limited = enforceRateLimit(req, {
      name: "whatsapp-inbound-webhook",
      limit: 300,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const rawBody = await readUtf8BodyWithinLimit(req, MAX_BODY_BYTES);
    if (rawBody === null) {
      return json({ ok: false, error: "payload_too_large" }, 413);
    }

    const authentication = await authenticate(req, rawBody);
    if (!authentication.ok) {
      return json(
        { ok: false, error: authentication.code },
        authentication.status,
      );
    }

    let event: EvolutionEvent;
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("payload inválido");
      }
      event = parsed as EvolutionEvent;
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400);
    }

    const payloadErrors = collectErrors([
      validateString(event.event, "event", { required: true, maxLength: 100 }),
      validateString(event.instance, "instance", { maxLength: 200 }),
    ]);
    if (payloadErrors.length) {
      return validationErrorResponse(payloadErrors, corsHeaders);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ ok: false, error: "server_misconfigured" }, 503);
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const eventName = asString(event.event) ?? "";

    try {
      // Acks de status das mensagens que enviamos (delivered/read/failed).
      if (eventName === "messages.update") {
        const acks = parseStatusAck(event);
        let updated = 0;
        for (const ack of acks) {
          const normalized = normalizeAckStatus(ack.status);
          if (!normalized) continue;

          const { data: msg, error: lookupError } = await supabase
            .from("outbound_messages")
            .select("id")
            .eq("provider_message_id", ack.providerMessageId)
            .maybeSingle();
          if (lookupError) throw lookupError;
          if (!msg) continue;

          const update: Record<string, unknown> = { status: normalized };
          const occurredAt = new Date().toISOString();
          if (normalized === "delivered") update.delivered_at = occurredAt;
          if (normalized === "read") update.read_at = occurredAt;

          // Compare-and-swap: ack atrasado não regride o estado.
          const { data: advanced, error: updateError } = await supabase
            .from("outbound_messages")
            .update(update)
            .eq("id", msg.id)
            .in("status", previousStatusesFor(normalized))
            .select("id");
          if (updateError) throw updateError;
          if (advanced?.length) updated++;
        }
        return json({ ok: true, type: "status", processed: acks.length, updated });
      }

      // Resposta recebida de um contato.
      if (eventName === "messages.upsert") {
        const inbound = parseInboundMessage(event);
        if (!inbound) {
          return json({ ok: true, ignored: true, reason: "not_inbound_reply" });
        }

        const messageErrors = collectErrors([
          validateString(inbound.providerMessageId, "data.key.id", {
            required: true,
            maxLength: 200,
          }),
          validateString(inbound.fromPhone, "data.key.remoteJid", {
            required: true,
            minLength: 6,
            maxLength: 40,
          }),
          validateString(inbound.text, "data.message", {
            maxLength: MAX_INBOUND_TEXT,
          }),
        ]);
        if (messageErrors.length) {
          return validationErrorResponse(messageErrors, corsHeaders);
        }

        const receivedAt = inbound.messageTimestamp
          ? new Date(inbound.messageTimestamp * 1000).toISOString()
          : new Date().toISOString();

        // Escopo por instância: a resposta só pode pausar a cadência de quem
        // enviou pela instância Evolution que a recebeu — dois vendedores com
        // instâncias diferentes para o mesmo número não se atropelam. Se a
        // instância não for credencial cadastrada, cai no último outbound
        // Evolution do número (fallback).
        const eventInstance = asString(event.instance);
        let instanceOwnerIds = new Set<string>();
        if (eventInstance) {
          const { data: credRows } = await supabase
            .from("channel_credentials")
            .select("owner_id")
            .eq("provider", "evolution")
            .eq("enabled", true)
            .filter("credentials->>instance", "eq", eventInstance);
          instanceOwnerIds = new Set(
            (credRows ?? []).map((r: { owner_id: string }) => r.owner_id),
          );
        }

        // Casa a resposta com a mensagem outbound da Evolution mais recente
        // para o número (o `to` enviado vai sem formatação; tenta com "+").
        const phoneVariants = [inbound.fromPhone, `+${inbound.fromPhone}`];
        const lastOutbounds = await chunkedIn<{
          id: string;
          enrollment_id: string | null;
          owner_id: string;
        }>(
          phoneVariants,
          (chunk) =>
            supabase
              .from("outbound_messages")
              .select("id, enrollment_id, owner_id")
              .eq("channel", "whatsapp")
              .eq("provider", "evolution")
              .in("to_number", chunk)
              .order("created_at", { ascending: false })
              .limit(25),
          { label: "whatsapp-inbound-webhook.last_outbound" },
        );
        const lastOutbound =
          (instanceOwnerIds.size
            ? lastOutbounds.find((o) => instanceOwnerIds.has(o.owner_id))
            : null) ?? lastOutbounds[0] ?? null;

        const matchedEnrollmentId = lastOutbound?.enrollment_id ?? null;

        // Idempotência de ingestão: retry do webhook cai no UNIQUE
        // (provider, message_id) — mas os efeitos rodam mesmo no caminho de
        // duplicado porque são idempotentes (auto_pause é no-op se já pausado;
        // replied_at filtra `.is(null)`). Isso cobre retry após falha entre o
        // insert e a pausa, que antes perdia a resposta definitivamente.
        const { data: inserted, error: insertError } = await supabase
          .from("inbound_reply_events")
          .upsert(
            {
              provider: "evolution",
              message_id: inbound.providerMessageId,
              from_email: inbound.fromPhone,
              subject: inbound.pushName
                ? `${inbound.pushName}: ${inbound.text.slice(0, 120)}`
                : inbound.text.slice(0, 140),
              received_at: receivedAt,
              event_type: "reply",
              matched_enrollment_id: matchedEnrollmentId,
              payload: inbound.raw as never,
            },
            { onConflict: "provider,message_id", ignoreDuplicates: true },
          )
          .select("id");
        if (insertError) throw insertError;
        const isDuplicate = !inserted?.length;

        if (matchedEnrollmentId) {
          const { error: pauseError } = await supabase.rpc(
            "auto_pause_enrollment",
            {
              _enrollment_id: matchedEnrollmentId,
              _reason: "reply_detected",
            },
          );
          if (pauseError) throw pauseError;

          // Mesmo critério do inbound-email-webhook: marca só a execução
          // enviada mais recente para não contaminar métricas A/B.
          const { data: latestExec } = await supabase
            .from("sequence_step_executions")
            .select("id")
            .eq("enrollment_id", matchedEnrollmentId)
            .eq("status", "sent")
            .is("replied_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (latestExec?.id) {
            await supabase
              .from("sequence_step_executions")
              .update({ replied_at: receivedAt })
              .eq("id", latestExec.id);
          }
        }

        if (isDuplicate) {
          return json({ ok: true, ignored: true, reason: "duplicate_ignored" });
        }

        return json({
          ok: true,
          type: "reply",
          matched: Boolean(matchedEnrollmentId),
        });
      }

      return json({ ok: true, ignored: true, reason: "event_not_handled" });
    } catch (error) {
      ctx.log("error", "whatsapp_inbound_processing_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return json({ ok: false, error: "processing_failed" }, 500);
    }
  }),
);
