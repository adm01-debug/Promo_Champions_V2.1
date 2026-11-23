import { assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { DesignPayloadError, DesignPayloadSchema, isUuid, toDesignRow } from "./mapping.ts";

const VALID_UUID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

Deno.test("isUuid aceita uuid v4 minusculo", () => {
  assertEquals(isUuid(VALID_UUID), true);
});

Deno.test("isUuid rejeita string vazia, null e uuid truncado", () => {
  assertEquals(isUuid(""), false);
  assertEquals(isUuid(null), false);
  assertEquals(isUuid("3f2504e0-4f89-11d3"), false);
  assertEquals(isUuid(123), false);
});

Deno.test("schema aceita o payload completo que o Promo Design emite", () => {
  const r = DesignPayloadSchema.safeParse({
    design_id: VALID_UUID,
    name: "Mockup caneca natal",
    product_name: "Caneca 325ml",
    product_sku: "CAN-325",
    thumbnail_url: "https://cdn/x.png",
    seller_email: "vendedor@empresa.com",
    updated_at: "2026-11-23T10:00:00Z",
  });
  assertEquals(r.success, true);
});

Deno.test("toDesignRow traduz todos os campos do payload", () => {
  const row = toDesignRow({
    design_id: VALID_UUID,
    name: "Mockup caneca natal",
    product_name: "Caneca 325ml",
    product_sku: "CAN-325",
    thumbnail_url: "https://cdn/x.png",
    seller_email: "vendedor@empresa.com",
    updated_at: "2026-11-23T10:00:00Z",
  });
  assertEquals(row, {
    design_id: VALID_UUID,
    name: "Mockup caneca natal",
    product_name: "Caneca 325ml",
    product_sku: "CAN-325",
    thumbnail_url: "https://cdn/x.png",
    seller_email: "vendedor@empresa.com",
    source_updated_at: "2026-11-23T10:00:00Z",
  });
});

Deno.test("toDesignRow aceita apenas o minimo e anula o resto", () => {
  const row = toDesignRow({ design_id: VALID_UUID, name: "Sem produto" });
  assertEquals(row.product_name, null);
  assertEquals(row.product_sku, null);
  assertEquals(row.thumbnail_url, null);
  assertEquals(row.seller_email, null);
  assertEquals(row.source_updated_at, null);
});

Deno.test("toDesignRow trata string vazia e whitespace como ausente", () => {
  const row = toDesignRow({
    design_id: VALID_UUID,
    name: "X",
    product_sku: "   ",
    thumbnail_url: "",
    seller_email: "  ",
  });
  assertEquals(row.product_sku, null);
  assertEquals(row.thumbnail_url, null);
  assertEquals(row.seller_email, null);
});

Deno.test("toDesignRow ignora campos de tipo errado sem lancar", () => {
  const row = toDesignRow({
    design_id: VALID_UUID,
    name: "X",
    product_sku: 42,
    thumbnail_url: { a: 1 },
    seller_email: ["a@b"],
  });
  assertEquals(row.product_sku, null);
  assertEquals(row.thumbnail_url, null);
  assertEquals(row.seller_email, null);
});

Deno.test("toDesignRow rejeita design_id ausente com field=design_id", () => {
  const err = assertThrows(() => toDesignRow({ name: "X" }), DesignPayloadError);
  assertEquals(err.field, "design_id");
});

Deno.test("toDesignRow rejeita design_id que nao e uuid", () => {
  assertThrows(() => toDesignRow({ design_id: "abc", name: "X" }), DesignPayloadError);
});

Deno.test("toDesignRow rejeita name ausente com field=name", () => {
  const err = assertThrows(() => toDesignRow({ design_id: VALID_UUID }), DesignPayloadError);
  assertEquals(err.field, "name");
});

Deno.test("toDesignRow rejeita name vazio", () => {
  assertThrows(() => toDesignRow({ design_id: VALID_UUID, name: "   " }), DesignPayloadError);
});

Deno.test("toDesignRow faz trim do nome", () => {
  assertEquals(toDesignRow({ design_id: VALID_UUID, name: "  Caneca  " }).name, "Caneca");
});