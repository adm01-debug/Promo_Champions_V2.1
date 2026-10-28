import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
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
  remoteJidAlt?: unknown;
  participant?: unknown;
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

function json(
  body: unknown,
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** `55119...@s.whatsapp.net` / `user:device@...` / `...@lid` / `...@g.us` → domínio + dígitos. */
function jidToPhone(remoteJid: string | null): {
  phone: string;
  isGroup: boolean;
  isLid: boolean;
} | null {
  if (!remoteJid) return null;
  const at = remoteJid.indexOf("@");
  if (at <= 0) return null;
  const domain = remoteJid.slice(at + 1);
  // Baileys/Evolution traz sufixo de device no localpart ('user:device@...'):
  // sem o split no ':', o dígito do device fundia no telefone.
  const phone = remoteJid.slice(0, at).split(":")[0].replace(/\D/g, "");
  if (!phone) return null;
  // JIDs @lid são identidade interna de linked device: os dígitos NÃO são
  // número de telefone — o chamador resolve via remoteJidAlt/participant ou
  // ignora a mensagem em vez de fabricar um fromPhone falso.
  return { phone, isGroup: domain === "g.us", isLid: domain === "lid" };
}

// Tipos de protocolo/controle que não são conteúdo enviado pelo usuário:
// distribuição de chave, mensagens de protocolo (revogação, config efêmera)
// etc. Também detectados dentro de wrappers (ephemeralMessage...) porque o
// extractText devolve o tipo interno.
const NON_CONTENT_MESSAGE_TYPES = new Set([
  "protocolMessage",
  "senderKeyDistributionMessage",
  "ephemeralSettingMessage",
]);

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

  // Reação (emoji) não é resposta textual: o tipo é preservado para o
  // chamador gravar event_type='reaction' em vez de 'reply'.
  const reaction = message.reactionMessage as { text?: unknown } | undefined;
  if (reaction) {
    return {
      text: asString(reaction.text) ?? "[reactionMessage]",
      messageType: "reactionMessage",
    };
  }

  // Wrappers que aninham a mensagem real (ephemeral, view-once, documento
  // com legenda): extrai o conteúdo de dentro em vez de registrar o tipo.
  for (const wrapper of [
    "ephemeralMessage",
    "viewOnceMessage",
    "viewOnceMessageV2",
    "viewOnceMessageV2Extension",
    "documentWithCaptionMessage",
  ]) {
    const inner = (message[wrapper] as { message?: unknown } | undefined)
      ?.message;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      return extractText(inner as Record<string, unknown>);
    }
  }

  // Mídia com legenda usa a legenda como texto.
  const media = message[type] as { caption?: unknown } | undefined;
  const caption = asString(media?.caption);
  if (caption) return { text: caption, messageType: type };

  // Mídia e outros tipos chegam sem texto legível — registra o tipo no lugar.
  return { text: `[${type}]`, messageType: type };
}

function parseInboundMessage(event: EvolutionEvent): InboundMessage | null {
  const data = event.data as
    | {
        key?: EvolutionKey;
        pushName?: unknown;
        message?: unknown;
        messageTimestamp?: unknown;
        messageStubType?: unknown;
        remoteJidAlt?: unknown;
        participant?: unknown;
      }
    | undefined;
  const key = data?.key;
  if (!key || key.fromMe !== false) return null;

  const providerMessageId = asString(key.id);
  let jid = jidToPhone(asString(key.remoteJid));
  if (jid?.isLid) {
    // @lid não carrega telefone: o JID real pode vir em remoteJidAlt
    // (Baileys/Evolution v2) ou participant; sem ele, ignorar em vez de
    // fabricar um fromPhone falso.
    const alt =
      asString(key.remoteJidAlt) ??
      asString(data?.remoteJidAlt) ??
      asString(key.participant) ??
      asString(data?.participant);
    jid = jidToPhone(alt);
    if (jid?.isLid) jid = null;
  }
  if (!providerMessageId || !jid || jid.isGroup) return null;

  // Stubs sem corpo (ligação perdida, metadados) ou só com campos de
  // protocolo/controle não são resposta do contato: ignorar para não
  // fabricar reply com texto vazio nem pausar cadência à toa.
  if (data?.messageStubType != null) return null;
  const message = data?.message;
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return null;
  }
  const messageRecord = message as Record<string, unknown>;
  const contentKeys = Object.keys(messageRecord).filter(
    (k) => k !== "messageContextInfo",
  );
  if (
    contentKeys.length === 0 ||
    contentKeys.every((k) => NON_CONTENT_MESSAGE_TYPES.has(k))
  ) {
    return null;
  }

  const { text, messageType } = extractText(messageRecord);
  if (NON_CONTENT_MESSAGE_TYPES.has(messageType)) return null;

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
    // Webhook server-to-server: chamador sem Origin recebe a 1ª origem da
    // allowlist; um Origin só é ecoado se estiver na allowlist (nunca "*").
    const cors = getCorsHeaders(req);
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (req.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, cors);
    }

    const limited = enforceRateLimit(req, {
      name: "whatsapp-inbound-webhook",
      limit: 300,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const rawBody = await readUtf8BodyWithinLimit(req, MAX_BODY_BYTES);
    if (rawBody === null) {
      return json({ ok: false, error: "payload_too_large" }, 413, cors);
    }

    const authentication = await authenticate(req, rawBody);
    if (!authentication.ok) {
      return json(
        { ok: false, error: authentication.code },
        authentication.status,
        cors,
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
      return json({ ok: false, error: "invalid_json" }, 400, cors);
    }

    const payloadErrors = collectErrors([
      validateString(event.event, "event", { required: true, maxLength: 100 }),
      validateString(event.instance, "instance", { maxLength: 200 }),
    ]);
    if (payloadErrors.length) {
      return validationErrorResponse(payloadErrors, cors);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ ok: false, error: "server_misconfigured" }, 503, cors);
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
        return json({ ok: true, type: "status", processed: acks.length, updated }, 200, cors);
      }

      // Resposta recebida de um contato.
      if (eventName === "messages.upsert") {
        const inbound = parseInboundMessage(event);
        if (!inbound) {
          return json({ ok: true, ignored: true, reason: "not_inbound_reply" }, 200, cors);
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
          return validationErrorResponse(messageErrors, cors);
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
        let instanceOwnerIds: string[] | null = null;
        if (eventInstance) {
          const { data: credRows } = await supabase
            .from("channel_credentials")
            .select("owner_id")
            .eq("provider", "evolution")
            .eq("enabled", true)
            .filter("credentials->>instance", "eq", eventInstance);
          const ids = (credRows ?? []).map(
            (r: { owner_id: string }) => r.owner_id,
          );
          if (ids.length) instanceOwnerIds = ids;
        }

        // Casa a resposta com a inscrição pausável via RPC — mesmo critério
        // do match_reply_to_enrollment do caminho de e-mail: enrollment
        // 'active'/'scheduled', não auto-pausada e iniciada antes da
        // resposta. Uma resposta tardia para enrollment já
        // completed/exited/failed NÃO a reverte para 'paused'. O match de
        // número normaliza to_number para dígitos em SQL (regexp_replace):
        // linhas antigas de outbound_messages podem guardar máscara e não
        // casariam com [dígitos, '+'+dígitos].
        const { data: matchedEnrollment, error: matchError } =
          await supabase.rpc("match_whatsapp_reply_to_enrollment", {
            _from_digits: inbound.fromPhone,
            _owner_ids: instanceOwnerIds,
            _received_at: receivedAt,
          });
        if (matchError) throw matchError;
        const matchedEnrollmentId =
          (matchedEnrollment as string | null) ?? null;

        // Reação (emoji) é registrada para visibilidade, mas não conta como
        // resposta: não pausa cadência nem preenche replied_at — confirmação
        // feita contra os consumidores de inbound_reply_events (listagem sem
        // filtro de tipo; nenhum exige 'reply').
        const isReaction = inbound.messageType === "reactionMessage";

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
              event_type: isReaction ? "reaction" : "reply",
              matched_enrollment_id: matchedEnrollmentId,
              payload: inbound.raw as never,
            },
            { onConflict: "provider,message_id", ignoreDuplicates: true },
          )
          .select("id");
        if (insertError) throw insertError;
        const isDuplicate = !inserted?.length;

        if (matchedEnrollmentId && !isReaction) {
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
          return json({ ok: true, ignored: true, reason: "duplicate_ignored" }, 200, cors);
        }

        return json(
          {
            ok: true,
            type: "reply",
            matched: Boolean(matchedEnrollmentId),
          },
          200,
          cors,
        );
      }

      return json({ ok: true, ignored: true, reason: "event_not_handled" }, 200, cors);
    } catch (error) {
      ctx.log("error", "whatsapp_inbound_processing_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return json({ ok: false, error: "processing_failed" }, 500, cors);
    }
  }),
);
