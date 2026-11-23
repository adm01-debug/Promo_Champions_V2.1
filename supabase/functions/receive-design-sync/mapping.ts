// Traducao pura (sem rede) do payload de design do Promo Design para a linha de
// public.designs_inbound. Mantida separada do handler para ser testavel sem Deno.serve.
export interface DesignPayloadInput {
  design_id?: unknown;
  name?: unknown;
  product_name?: unknown;
  product_sku?: unknown;
  thumbnail_url?: unknown;
  seller_email?: unknown;
  updated_at?: unknown;
}

export interface DesignRow {
  design_id: string;
  name: string;
  product_name: string | null;
  product_sku: string | null;
  thumbnail_url: string | null;
  seller_email: string | null;
  source_updated_at: string | null;
}

export class DesignPayloadError extends Error {
  constructor(public readonly field: string, public readonly reason: string) {
    super(`payload.${field}: ${reason}`);
    this.name = "DesignPayloadError";
  }
}

export function isUuid(v: unknown): v is string {
  return typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function text(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

/** Converte o payload validado na linha do banco. Lanca DesignPayloadError se invalido. */
export function toDesignRow(p: DesignPayloadInput): DesignRow {
  if (!isUuid(p.design_id)) throw new DesignPayloadError("design_id", "expected_uuid");
  const name = text(p.name);
  if (!name) throw new DesignPayloadError("name", "required");
  return {
    design_id: p.design_id,
    name,
    product_name: text(p.product_name),
    product_sku: text(p.product_sku),
    thumbnail_url: text(p.thumbnail_url),
    seller_email: text(p.seller_email),
    source_updated_at: text(p.updated_at),
  };
}