// State de OAuth assinado com HMAC-SHA256 (stateless, sem tabela).
//
// Formato: `<payload_b64>.<assinatura_b64>`, onde payload_b64 =
// base64url(`${userId}:${nonce}:${expMs}`). A assinatura cobre o payload
// inteiro — qualquer adulteração de userId ou expiração invalida o state.
// O nonce impõe aleatoriedade por emissão (não há verificação de replay;
// a janela curta de expiração limita reuso).

import { isExpectedSharedSecret } from "./internal-service-auth.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function base64UrlEncode(input: string | ArrayBuffer): string {
  const bytes =
    typeof input === "string" ? encoder.encode(input) : new Uint8Array(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(value: string): string {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return decoder.decode(bytes);
}

async function hmacSha256(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64UrlEncode(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export interface SignedOAuthState {
  userId: string;
  nonce: string;
  expiresAt: number;
}

export async function createSignedOAuthState(
  userId: string,
  secret: string,
  ttlMs: number,
): Promise<string> {
  const payload = base64UrlEncode(
    `${userId}:${crypto.randomUUID()}:${Date.now() + ttlMs}`,
  );
  return `${payload}.${await hmacSha256(payload, secret)}`;
}

/**
 * Verifica assinatura e expiração. Retorna o payload decodificado ou null
 * quando o state está ausente, malformado, adulterado ou expirado.
 */
export async function verifySignedOAuthState(
  state: string | null,
  secret: string,
): Promise<SignedOAuthState | null> {
  if (!state || !secret) return null;
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return null;

  const expected = await hmacSha256(payload, secret);
  if (!isExpectedSharedSecret(signature, expected)) return null;

  let decoded: string;
  try {
    decoded = base64UrlDecode(payload);
  } catch {
    return null;
  }

  const [userId, nonce, exp] = decoded.split(":");
  const expiresAt = Number(exp);
  if (!userId || !nonce || !Number.isFinite(expiresAt)) return null;
  if (expiresAt < Date.now()) return null;

  return { userId, nonce, expiresAt };
}
