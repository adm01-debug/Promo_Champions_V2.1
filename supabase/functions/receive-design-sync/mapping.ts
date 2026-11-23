// Contrato e traducao do design emitido pelo Promo Design.
//
// O schema vive aqui (e nao no handler) porque o guard do repo
// (scripts/lint-input-validation.ts) exige que toda edge que grava importe um
// validador compartilhado, e a traducao para a linha do banco precisa ser
// testavel sem subir Deno.serve.
import { z } from "npm:zod@3";

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

// Campo textual opcional: string vazia, whitespace, null ou tipo errado viram null
// em vez de derrubar o evento inteiro - o design chega no CRM com o que existir.
const optionalText = z.unknown().transform((v) =>
  typeof v === "string" && v.trim().length > 0 ? v : null
);

export const DesignPayloadSchema = z.object({
  design_id: z.string().uuid({ message: "expected_uuid" }),
  name: z.string().trim().min(1, { message: "required" }).max(300),
  product_name: optionalText,
  product_sku: optionalText,
  thumbnail_url: optionalText,
  seller_email: optionalText,
  updated_at: optionalText,
});

export type DesignPayloadParsed = z.infer<typeof DesignPayloadSchema>;

export interface DesignRow {
  design_id: string;
  name: string;
  product_name: string | null;
  product_sku: string | null;
  thumbnail_url: string | null;
  seller_email: string | null;
  source_updated_at: string | null;
}

/** Converte o payload no formato de public.designs_inbound. Lanca DesignPayloadError se invalido. */
export function toDesignRow(p: unknown): DesignRow {
  const parsed = DesignPayloadSchema.safeParse(p);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = String(issue?.path[0] ?? "payload");
    throw new DesignPayloadError(field, issue?.message ?? "invalid");
  }
  return rowFromParsed(parsed.data);
}

/** Atalho para o caminho que ja passou por validateWebhookPayload no handler. */
export function rowFromParsed(d: DesignPayloadParsed): DesignRow {
  return {
    design_id: d.design_id,
    name: d.name,
    product_name: d.product_name,
    product_sku: d.product_sku,
    thumbnail_url: d.thumbnail_url,
    seller_email: d.seller_email,
    source_updated_at: d.updated_at,
  };
}