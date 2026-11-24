/**
 * Contrato de entrega Champions -> Supply.
 *
 * Fica sem Supabase e sem rede para poder ser testado: o que quebra uma
 * integracao quase sempre e o envelope ou a assinatura, nao o HTTP.
 */

export interface SupplyOutboxRow {
  id: string;
  event: string;
  payload: Record<string, unknown>;
  attempts: number;
}

export interface SupplyEnvelope {
  event: string;
  correlation_key: string;
  payload: Record<string, unknown>;
}

/**
 * Envelope aceito por `receive-os-sync` (Promo Supply). `correlation_key` nao
 * e a chave de idempotencia do outro lado: o Supply usa `payload.os_id`, que
 * aqui carrega o id do item do pedido.
 */
export function buildEnvelope(row: SupplyOutboxRow): SupplyEnvelope {
  return {
    event: row.event,
    correlation_key: row.id,
    payload: row.payload ?? {},
  };
}

/** Assinatura no formato esperado pelo Supply: `sha256=<hex>`. */
export function signatureFor(secret: string, rawBody: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  const data = new TextEncoder().encode(rawBody);
  return crypto.subtle
    .importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((imported) => crypto.subtle.sign("HMAC", imported, data))
    .then((bytes) => {
      const hex = Array.from(new Uint8Array(bytes))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return `sha256=${hex}`;
    });
}

/** 2xx = entregue. O resto conta como falha e volta para a fila com backoff. */
export function isDelivered(status: number): boolean {
  return status >= 200 && status < 300;
}
