/**
 * Regras puras de integridade para callbacks de provedores.
 *
 * Não há deduplicação persistente neste módulo: ela depende de uma chave única
 * ou RPC transacional que ainda precisa ser reconciliada entre os bancos.
 */

export type NormalizedMessageStatus = "sent" | "delivered" | "read" | "failed";
type PersistedMessageStatus = "queued" | NormalizedMessageStatus;

const PREVIOUS_STATUSES: Record<
  NormalizedMessageStatus,
  readonly PersistedMessageStatus[]
> = {
  sent: ["queued"],
  delivered: ["queued", "sent"],
  read: ["queued", "sent", "delivered"],
  failed: ["queued", "sent"],
};

/**
 * Estados que podem avançar para o status recebido. A lista é usada como
 * predicado no UPDATE, portanto a transição e a decisão de engajamento ficam
 * na mesma operação atômica do Postgres.
 */
export function previousStatusesFor(
  next: NormalizedMessageStatus,
): string[] {
  return [...PREVIOUS_STATUSES[next]];
}

export function canAdvanceMessageStatus(
  current: string | null | undefined,
  next: NormalizedMessageStatus,
): boolean {
  return current !== null && current !== undefined &&
    PREVIOUS_STATUSES[next].includes(current as PersistedMessageStatus);
}

export type InboundEmailProvider = "resend" | "sendgrid" | "generic";
export type InboundEventType =
  | "reply"
  | "bounce"
  | "complaint"
  | "unsubscribe"
  | "other";
export type InboundEmailPayload =
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

export interface ParsedInboundEmailEvent {
  provider: InboundEmailProvider;
  messageId: string | null;
  fromEmail: string | null;
  subject: string | null;
  receivedAt: string;
  eventType: InboundEventType;
  payload: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeEventType(value: unknown): InboundEventType {
  const type = asString(value)?.toLowerCase() ?? "";
  if (type.includes("bounce")) return "bounce";
  if (type.includes("complain") || type === "spamreport") return "complaint";
  if (type.includes("unsubscribe")) return "unsubscribe";
  if (
    type.includes("reply") || type.includes("received") || type === "inbound"
  ) {
    return "reply";
  }
  return "other";
}

function unixTimestampToIso(value: unknown, now: () => string): string {
  const numeric = typeof value === "number" || typeof value === "string"
    ? Number(value)
    : Number.NaN;
  if (!Number.isFinite(numeric) || numeric <= 0) return now();
  const date = new Date(numeric * 1000);
  return Number.isNaN(date.getTime()) ? now() : date.toISOString();
}

function extractEmail(value: unknown): string | null {
  const raw = asString(value);
  return raw ? raw.replace(/.*<([^>]+)>.*/, "$1") : null;
}

function parseResendEvent(
  payload: Record<string, unknown>,
  now: () => string,
): ParsedInboundEmailEvent {
  const data = isRecord(payload.data) ? payload.data : {};
  return {
    provider: "resend",
    messageId: asString(data.email_id) ?? asString(data.id),
    fromEmail: extractEmail(data.from),
    subject: asString(data.subject),
    receivedAt: asString(data.created_at) ?? now(),
    eventType: normalizeEventType(payload.type),
    payload,
  };
}

function parseSendGridEvent(
  payload: Record<string, unknown>,
  now: () => string,
): ParsedInboundEmailEvent {
  return {
    provider: "sendgrid",
    messageId: asString(payload.sg_message_id),
    fromEmail: extractEmail(payload.email),
    subject: asString(payload.subject),
    receivedAt: payload.timestamp === undefined
      ? now()
      : unixTimestampToIso(payload.timestamp, now),
    eventType: normalizeEventType(payload.event),
    payload,
  };
}

function parseGenericEvent(
  payload: Record<string, unknown>,
  now: () => string,
): ParsedInboundEmailEvent {
  return {
    provider: "generic",
    messageId: asString(payload.message_id),
    fromEmail: extractEmail(payload.from),
    subject: asString(payload.subject),
    receivedAt: asString(payload.received_at) ?? now(),
    eventType: normalizeEventType(payload.event_type),
    payload,
  };
}

/**
 * Converte o corpo já autenticado em eventos individuais. Um lote SendGrid é
 * preservado integralmente: cada objeto assinado se torna uma operação visível.
 */
export function parseInboundEmailEvents(
  payload: InboundEmailPayload,
  provider: InboundEmailProvider,
  now: () => string = () => new Date().toISOString(),
): ParsedInboundEmailEvent[] {
  if (provider === "resend") {
    return isRecord(payload) ? [parseResendEvent(payload, now)] : [];
  }

  if (provider === "sendgrid") {
    const batch = Array.isArray(payload) ? payload : [payload];
    if (batch.length === 0 || batch.some((event) => !isRecord(event))) {
      return [];
    }
    return batch.map((event) => parseSendGridEvent(event, now));
  }

  return isRecord(payload) ? [parseGenericEvent(payload, now)] : [];
}

/** Eventos de telemetria ainda são registrados, mas não pausam uma cadência. */
export function shouldMatchAndPauseEnrollment(
  eventType: InboundEventType,
): boolean {
  return eventType !== "other";
}
