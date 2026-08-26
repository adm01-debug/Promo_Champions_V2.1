/**
 * Verificadores criptográficos para endpoints de webhook públicos.
 *
 * A validação precisa ocorrer sobre o corpo bruto, antes de qualquer parse ou
 * operação com service_role. Os helpers aceitam um leitor de ambiente para
 * manter a lógica testável e impedir que um segredo ausente vire bypass.
 */

export type EnvReader = (name: string) => string | undefined;

export type WebhookAuthentication<P extends string> =
  | { ok: true; provider: P }
  | { ok: false; status: 401 | 503; code: string };

const encoder = new TextEncoder();
const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Normaliza para ArrayBuffer, evitando a ambiguidade ArrayBufferLike do lib DOM. */
function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function fromBase64(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

/** Comparação em tempo constante para valores textuais de tamanho conhecido. */
export function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function hmac(
  secret: string | Uint8Array,
  value: string,
  hash: "SHA-1" | "SHA-256",
): Promise<Uint8Array> {
  const material = typeof secret === "string" ? encoder.encode(secret) : secret;
  const key = await crypto.subtle.importKey(
    "raw",
    asArrayBuffer(material),
    { name: "HMAC", hash: { name: hash } },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(value)),
  );
}

export async function hmacSha256Hex(
  secret: string,
  rawBody: string,
): Promise<string> {
  return toHex(await hmac(secret, rawBody, "SHA-256"));
}

export async function hmacSha256Base64(
  secret: string | Uint8Array,
  value: string,
): Promise<string> {
  return toBase64(await hmac(secret, value, "SHA-256"));
}

export async function hmacSha1Base64(
  secret: string,
  value: string,
): Promise<string> {
  return toBase64(await hmac(secret, value, "SHA-1"));
}

/** Aceita os formatos `hex` e `sha256=<hex>`. */
export async function verifyHmacSha256Signature(
  secret: string,
  rawBody: string,
  receivedSignature: string | null,
): Promise<boolean> {
  if (!secret || !receivedSignature) return false;
  const provided = receivedSignature.trim().replace(/^sha256=/i, "")
    .toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(provided)) return false;
  const expected = await hmacSha256Hex(secret, rawBody);
  return timingSafeEqual(expected, provided);
}

export function isFreshUnixTimestamp(
  timestamp: string | null,
  now = Date.now(),
  maxAgeMs = MAX_SIGNATURE_AGE_MS,
): boolean {
  if (!timestamp || !/^\d{10,13}$/.test(timestamp)) return false;
  const numeric = Number(timestamp);
  if (!Number.isFinite(numeric)) return false;
  const milliseconds = timestamp.length === 13 ? numeric : numeric * 1000;
  return Math.abs(now - milliseconds) <= maxAgeMs;
}

/** Verifica a assinatura Svix usada pelos webhooks do Resend. */
export async function verifyResendSvixSignature(
  secret: string,
  rawBody: string,
  headers: Headers,
  now = Date.now(),
): Promise<boolean> {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!id || !signature || !isFreshUnixTimestamp(timestamp, now)) return false;

  const encodedSecret = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  const secretBytes = fromBase64(encodedSecret);
  if (!secretBytes) return false;

  const expected = await hmacSha256Base64(
    secretBytes,
    `${id}.${timestamp}.${rawBody}`,
  );
  return signature
    .trim()
    .split(/\s+/)
    .some((candidate) => {
      const [version, value] = candidate.split(",", 2);
      return version === "v1" && Boolean(value) &&
        timingSafeEqual(expected, value);
    });
}

function compareAscii(left: string, right: string): number {
  return left === right ? 0 : left < right ? -1 : 1;
}

/** String canônica documentada pela Twilio para webhooks form-urlencoded. */
export function twilioSigningPayload(
  url: string,
  rawBody: string,
  contentType: string,
): string {
  if (
    !contentType.toLowerCase().includes("application/x-www-form-urlencoded")
  ) return url;

  const params = Array.from(new URLSearchParams(rawBody).entries())
    .sort(([leftName, leftValue], [rightName, rightValue]) => {
      const nameOrder = compareAscii(leftName, rightName);
      return nameOrder === 0 ? compareAscii(leftValue, rightValue) : nameOrder;
    });
  return url + params.map(([name, value]) => `${name}${value}`).join("");
}

export async function verifyTwilioSignature(
  authToken: string,
  url: string,
  rawBody: string,
  contentType: string,
  receivedSignature: string | null,
): Promise<boolean> {
  if (!authToken || !receivedSignature) return false;
  const expected = await hmacSha1Base64(
    authToken,
    twilioSigningPayload(url, rawBody, contentType),
  );
  return timingSafeEqual(expected, receivedSignature.trim());
}

export async function verifyMetaSignature(
  appSecret: string,
  rawBody: string,
  receivedSignature: string | null,
): Promise<boolean> {
  return verifyHmacSha256Signature(appSecret, rawBody, receivedSignature);
}

function derLength(
  bytes: Uint8Array,
  offset: number,
): [length: number, next: number] | null {
  const first = bytes[offset];
  if (first === undefined) return null;
  if ((first & 0x80) === 0) return [first, offset + 1];
  const count = first & 0x7f;
  if (count === 0 || count > 2 || offset + count >= bytes.length) return null;
  let length = 0;
  for (let index = 0; index < count; index++) {
    length = (length << 8) | bytes[offset + 1 + index];
  }
  return [length, offset + 1 + count];
}

function derInteger(
  bytes: Uint8Array,
  offset: number,
): [value: Uint8Array, next: number] | null {
  if (bytes[offset] !== 0x02) return null;
  const length = derLength(bytes, offset + 1);
  if (!length) return null;
  const [size, start] = length;
  const end = start + size;
  if (size === 0 || end > bytes.length) return null;
  return [bytes.slice(start, end), end];
}

/** Converte uma assinatura ASN.1 DER P-256 para o formato raw do Web Crypto. */
export function derEcdsaSignatureToP1363(
  signature: Uint8Array,
): Uint8Array | null {
  if (signature[0] !== 0x30) return null;
  const sequenceLength = derLength(signature, 1);
  if (!sequenceLength) return null;
  const [size, start] = sequenceLength;
  if (start + size !== signature.length) return null;

  const first = derInteger(signature, start);
  if (!first) return null;
  const second = derInteger(signature, first[1]);
  if (!second || second[1] !== signature.length) return null;

  const result = new Uint8Array(64);
  for (
    const [integer, targetOffset] of [[first[0], 0], [second[0], 32]] as const
  ) {
    let normalized = integer;
    const hasSignPadding = normalized.length > 1 && normalized[0] === 0;
    while (normalized.length > 1 && normalized[0] === 0) {
      normalized = normalized.slice(1);
    }
    if (
      normalized.length > 32 ||
      (!hasSignPadding && (normalized[0] & 0x80) !== 0)
    ) return null;
    result.set(normalized, targetOffset + 32 - normalized.length);
  }
  return result;
}

function parsePublicKey(pem: string): Uint8Array | null {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s/g, "");
  return fromBase64(base64);
}

/** Verifica a assinatura ECDSA P-256 dos webhooks do Twilio SendGrid. */
export async function verifySendGridSignature(
  publicKeyPem: string,
  rawBody: string,
  timestamp: string | null,
  receivedSignature: string | null,
  now = Date.now(),
): Promise<boolean> {
  if (
    !publicKeyPem || !receivedSignature || !isFreshUnixTimestamp(timestamp, now)
  ) return false;
  const publicKeyBytes = parsePublicKey(publicKeyPem);
  const signatureBytes = fromBase64(receivedSignature);
  if (!publicKeyBytes || !signatureBytes) return false;

  const signature = signatureBytes.length === 64
    ? signatureBytes
    : derEcdsaSignatureToP1363(signatureBytes);
  if (!signature) return false;

  try {
    const key = await crypto.subtle.importKey(
      "spki",
      asArrayBuffer(publicKeyBytes),
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
    return await crypto.subtle.verify(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      key,
      asArrayBuffer(signature),
      encoder.encode(`${timestamp}${rawBody}`),
    );
  } catch {
    return false;
  }
}

function configuredSecret(
  env: EnvReader,
  ...names: string[]
): string | undefined {
  return names.map((name) => env(name)).find((value): value is string =>
    Boolean(value)
  );
}

function failure(
  status: 401 | 503,
  code: string,
): WebhookAuthentication<never> {
  return { ok: false, status, code };
}

function oneSignatureScheme(
  schemes: Array<{ name: string; present: boolean }>,
): string | null | "ambiguous" {
  const active = schemes.filter((scheme) => scheme.present).map((scheme) =>
    scheme.name
  );
  if (active.length === 0) return null;
  return active.length === 1 ? active[0] : "ambiguous";
}

export async function authenticateInboundEmailWebhook(
  headers: Headers,
  rawBody: string,
  env: EnvReader,
  now = Date.now(),
): Promise<WebhookAuthentication<"resend" | "sendgrid" | "generic">> {
  const scheme = oneSignatureScheme([
    {
      name: "resend",
      present: Boolean(
        headers.get("svix-id") || headers.get("svix-timestamp") ||
          headers.get("svix-signature"),
      ),
    },
    {
      name: "sendgrid",
      present: Boolean(
        headers.get("x-twilio-email-event-webhook-signature") ||
          headers.get("x-twilio-email-event-webhook-timestamp"),
      ),
    },
    { name: "generic", present: Boolean(headers.get("x-webhook-signature")) },
  ]);

  if (scheme === null) return failure(401, "signature_missing");
  if (scheme === "ambiguous") return failure(401, "ambiguous_signature");

  if (scheme === "resend") {
    const secret = configuredSecret(env, "RESEND_WEBHOOK_SECRET");
    if (!secret) return failure(503, "webhook_not_configured");
    return await verifyResendSvixSignature(secret, rawBody, headers, now)
      ? { ok: true, provider: "resend" }
      : failure(401, "invalid_signature");
  }

  if (scheme === "sendgrid") {
    const publicKey = configuredSecret(
      env,
      "SENDGRID_WEBHOOK_PUBLIC_KEY",
      "SENDGRID_WEBHOOK_VERIFICATION_KEY",
    );
    if (!publicKey) return failure(503, "webhook_not_configured");
    return await verifySendGridSignature(
        publicKey,
        rawBody,
        headers.get("x-twilio-email-event-webhook-timestamp"),
        headers.get("x-twilio-email-event-webhook-signature"),
        now,
      )
      ? { ok: true, provider: "sendgrid" }
      : failure(401, "invalid_signature");
  }

  const secret = configuredSecret(env, "INBOUND_EMAIL_WEBHOOK_SECRET");
  if (!secret) return failure(503, "webhook_not_configured");
  return await verifyHmacSha256Signature(
      secret,
      rawBody,
      headers.get("x-webhook-signature"),
    )
    ? { ok: true, provider: "generic" }
    : failure(401, "invalid_signature");
}

export async function authenticateMultichannelStatusWebhook(
  headers: Headers,
  rawBody: string,
  requestUrl: string,
  env: EnvReader,
): Promise<WebhookAuthentication<"twilio" | "meta_cloud" | "generic">> {
  const scheme = oneSignatureScheme([
    { name: "twilio", present: Boolean(headers.get("x-twilio-signature")) },
    {
      name: "meta_cloud",
      present: Boolean(headers.get("x-hub-signature-256")),
    },
    { name: "generic", present: Boolean(headers.get("x-webhook-signature")) },
  ]);

  if (scheme === null) return failure(401, "signature_missing");
  if (scheme === "ambiguous") return failure(401, "ambiguous_signature");

  if (scheme === "twilio") {
    const authToken = configuredSecret(env, "TWILIO_AUTH_TOKEN");
    if (!authToken) return failure(503, "webhook_not_configured");
    const configuredUrl = configuredSecret(env, "TWILIO_WEBHOOK_URL") ??
      requestUrl;
    return await verifyTwilioSignature(
        authToken,
        configuredUrl,
        rawBody,
        headers.get("content-type") ?? "",
        headers.get("x-twilio-signature"),
      )
      ? { ok: true, provider: "twilio" }
      : failure(401, "invalid_signature");
  }

  if (scheme === "meta_cloud") {
    const appSecret = configuredSecret(
      env,
      "META_APP_SECRET",
      "META_WEBHOOK_APP_SECRET",
    );
    if (!appSecret) return failure(503, "webhook_not_configured");
    return await verifyMetaSignature(
        appSecret,
        rawBody,
        headers.get("x-hub-signature-256"),
      )
      ? { ok: true, provider: "meta_cloud" }
      : failure(401, "invalid_signature");
  }

  const secret = configuredSecret(env, "MULTICHANNEL_WEBHOOK_SECRET");
  if (!secret) return failure(503, "webhook_not_configured");
  return await verifyHmacSha256Signature(
      secret,
      rawBody,
      headers.get("x-webhook-signature"),
    )
    ? { ok: true, provider: "generic" }
    : failure(401, "invalid_signature");
}

/** Handshake GET do Meta Cloud; sem segredo configurado, recusa sem bypass. */
export function verifyMetaWebhookHandshake(
  url: URL,
  env: EnvReader,
): WebhookAuthentication<"meta_cloud"> {
  const verifyToken = configuredSecret(env, "META_WEBHOOK_VERIFY_TOKEN");
  if (!verifyToken) return failure(503, "webhook_not_configured");
  const mode = url.searchParams.get("hub.mode");
  const receivedToken = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (
    mode !== "subscribe" ||
    !receivedToken ||
    !challenge ||
    !timingSafeEqual(verifyToken, receivedToken)
  ) {
    return failure(401, "invalid_handshake");
  }
  return { ok: true, provider: "meta_cloud" };
}
