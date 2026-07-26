/**
 * Utilitários de opt-out (descadastro) de e-mails.
 *
 * Motivação: envios de prospecção precisam de um mecanismo de descadastro
 * verificável (link assinado por HMAC) e de um guarda-chuva que impeça
 * qualquer envio para endereços já descadastrados.
 */

export interface OptOutFilterResult<T> {
  allowed: T[];
  blocked: T[];
}

const encoder = new TextEncoder();

function secretKey(): string {
  return (
    Deno.env.get("UNSUBSCRIBE_SECRET") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    ""
  );
}

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Assina o e-mail com HMAC-SHA256 (base64url, truncado a 32 chars). */
export async function makeUnsubscribeToken(email: string): Promise<string> {
  const secret = secretKey();
  if (!secret) throw new Error("unsubscribe_secret_missing");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(normalizeEmail(email)));
  return toBase64Url(new Uint8Array(sig)).slice(0, 32);
}

/** Comparação em tempo constante para evitar timing attacks. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyUnsubscribeToken(email: string, token: string): Promise<boolean> {
  if (!token) return false;
  try {
    return safeEqual(await makeUnsubscribeToken(email), token);
  } catch {
    return false;
  }
}

/** URL pública do link de descadastro para um endereço. */
export async function buildUnsubscribeUrl(email: string, baseUrl?: string): Promise<string> {
  const base = (baseUrl ?? Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");
  const token = await makeUnsubscribeToken(email);
  const e = encodeURIComponent(normalizeEmail(email));
  return `${base}/functions/v1/email-unsubscribe?e=${e}&t=${token}`;
}

/** Rodapé HTML padrão com link de descadastro (LGPD/CAN-SPAM). */
export async function unsubscribeFooterHtml(email: string, baseUrl?: string): Promise<string> {
  const url = await buildUnsubscribeUrl(email, baseUrl);
  return (
    `<hr style="margin-top:24px;border:none;border-top:1px solid #e5e7eb" />` +
    `<p style="font-size:12px;color:#6b7280;margin-top:12px">` +
    `Não quer mais receber estes e-mails? ` +
    `<a href="${url}" style="color:#6b7280">Descadastrar</a>.</p>`
  );
}

/** Cabeçalhos RFC 8058 (one-click unsubscribe) para provedores de e-mail. */
export async function unsubscribeHeaders(
  email: string,
  baseUrl?: string,
): Promise<Record<string, string>> {
  const url = await buildUnsubscribeUrl(email, baseUrl);
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

interface MinimalClient {
  from: (table: string) => {
    select: (cols: string) => {
      in: (col: string, values: string[]) => Promise<{ data: { email: string }[] | null; error: unknown }>;
    };
  };
}

/**
 * Divide uma lista de destinatários entre permitidos e bloqueados por opt-out.
 * Falha fechada: se a consulta falhar, nada é liberado para envio.
 */
export async function filterOptedOut<T>(
  client: MinimalClient,
  items: T[],
  getEmail: (item: T) => string | null | undefined,
): Promise<OptOutFilterResult<T>> {
  const emails = Array.from(
    new Set(items.map((i) => normalizeEmail(getEmail(i))).filter((e) => e.length > 0)),
  );
  if (emails.length === 0) return { allowed: items, blocked: [] };

  const optedOut = new Set<string>();
  const CHUNK = 200;
  for (let i = 0; i < emails.length; i += CHUNK) {
    const slice = emails.slice(i, i + CHUNK);
    const { data, error } = await client.from("email_opt_outs").select("email").in("email", slice);
    if (error) throw new Error("opt_out_lookup_failed");
    for (const row of data ?? []) optedOut.add(normalizeEmail(row.email));
  }

  const allowed: T[] = [];
  const blocked: T[] = [];
  for (const item of items) {
    if (optedOut.has(normalizeEmail(getEmail(item)))) blocked.push(item);
    else allowed.push(item);
  }
  return { allowed, blocked };
}

/**
 * Classificação de supressão a partir de eventos de webhook de e-mail.
 *
 * Regra: bounce permanente (hard), reclamação de spam e descadastro no
 * provedor suprimem o endereço. Bounce temporário (soft/transient) NÃO
 * suprime — o destinatário continua válido e o retry é legítimo.
 */
export type SuppressionReason = "hard_bounce" | "complaint" | "unsubscribe";

export function classifySuppression(
  eventType: string,
  payload: Record<string, unknown> = {},
): SuppressionReason | null {
  const type = (eventType ?? "").toLowerCase();
  if (type === "complaint") return "complaint";
  if (type === "unsubscribe") return "unsubscribe";
  if (type !== "bounce") return null;

  // Detecta a natureza do bounce em formatos comuns (Resend/SendGrid/genérico).
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const bounce = (data.bounce ?? {}) as Record<string, unknown>;
  const raw = [
    bounce.type,
    bounce.subType,
    (data as { type?: unknown }).type,
    (data as { bounce_classification?: unknown }).bounce_classification,
    (payload as { type?: unknown }).type,
  ]
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();

  if (/soft|transient|temporary|deferred|mailbox_full|throttl/.test(raw)) return null;
  return "hard_bounce";
}
