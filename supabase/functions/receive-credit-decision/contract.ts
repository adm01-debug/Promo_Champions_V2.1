/**
 * Contrato da decisao de credito devolvida pelo Promo Finance.
 *
 * Envelope (mesmo formato dos demais webhooks inbound do CRM):
 *   headers: x-webhook-signature: sha256=<hex>, x-webhook-event, x-correlation-key
 *   body:    { event: 'credito.decidido', correlation_key, payload }
 *   secret:  FINANCE_CREDITO_WEBHOOK_SECRET
 *
 * Sem Supabase e sem rede para poder ser testado.
 */
import { z } from "npm:zod@3";

export const CREDIT_DECISION_EVENT = "credito.decidido";

export const CreditDecisionPayloadSchema = z.object({
  pedido_id: z.string().uuid({ message: "pedido_id deve ser um UUID" }),
  analise_id: z.string().min(1, { message: "analise_id e obrigatorio" }),
  decisao: z.enum(["aprovado", "reprovado"], {
    errorMap: () => ({ message: "decisao deve ser 'aprovado' ou 'reprovado'" }),
  }),
  limite_aprovado: z.number().nonnegative().optional().nullable(),
  parcelas_max: z.number().int().positive().max(60).optional().nullable(),
  parecer: z.string().max(2000).optional().nullable(),
  decidido_em: z.string().optional().nullable(),
});

export type CreditDecisionPayload = z.infer<typeof CreditDecisionPayloadSchema>;

const encoder = new TextEncoder();

export async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Aceita `sha256=<hex>` ou o hex cru; compara em tempo constante. */
export async function signatureMatches(
  secret: string,
  rawBody: string,
  header: string,
): Promise<boolean> {
  const expected = await hmacSha256Hex(secret, rawBody);
  const provided = (header.startsWith("sha256=") ? header.slice("sha256=".length) : header)
    .toLowerCase();
  return timingSafeEqual(expected, provided);
}
