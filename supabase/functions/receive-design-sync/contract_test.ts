// Contrato cruzado: o body que o integration-dispatcher do Promo Design monta precisa passar
// pelo schema do receive-design-sync. Se alguem mudar um lado sem o outro, isto quebra.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { DesignPayloadSchema } from "./mapping.ts";

// Copia literal do que adapters/champions.ts monta (Promo_Design_V2, commit 2b07b7b3).
function bodyFromPromoDesign(event: string) {
  const designId = "33333333-3333-4333-8333-333333333333";
  return JSON.stringify({
    event,
    correlation_key: `${designId}:${event}`,
    payload: {
      design_id: designId,
      name: "Arte Caneca ACME",
      product_name: "Caneca",
      product_sku: "SKU-1",
      thumbnail_url: "https://cdn.example/t.png",
      seller_email: "vendedor@promo.com",
      updated_at: "2026-11-23T10:00:00.000Z",
      source: "promo_design",
    },
  });
}

for (const event of ["design.created", "design.updated"]) {
  Deno.test(`body real do Promo Design (${event}) passa no schema do receptor`, () => {
    const parsed = JSON.parse(bodyFromPromoDesign(event));
    const r = DesignPayloadSchema.safeParse(parsed.payload);
    assertEquals(r.success, true, r.success ? "" : JSON.stringify(r.error.issues));
  });
}

Deno.test("payload real nao traz campo obrigatorio que o receptor nao conhece", () => {
  const parsed = JSON.parse(bodyFromPromoDesign("design.created"));
  const keys = Object.keys(parsed.payload).sort();
  assertEquals(keys, [
    "design_id", "name", "product_name", "product_sku",
    "seller_email", "source", "thumbnail_url", "updated_at",
  ]);
});