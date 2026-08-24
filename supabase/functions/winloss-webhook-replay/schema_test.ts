import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { BodySchema } from "./schema.ts";

const UUID_A = "11111111-1111-4111-8111-111111111111";
const UUID_B = "22222222-2222-4222-8222-222222222222";
const UUID_C = "33333333-3333-4333-8333-333333333333";

function manyUuids(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const hex = i.toString(16).padStart(12, "0");
    return `00000000-0000-4000-8000-${hex}`;
  });
}

// ────────────────────────────────────────────────────────────────────
// ACCEPTS — delivery_ids (1..50)
// ────────────────────────────────────────────────────────────────────

Deno.test("delivery_ids: aceita 1 UUID válido", () => {
  const r = BodySchema.safeParse({ delivery_ids: [UUID_A] });
  assert(r.success, JSON.stringify(r));
  assertEquals(r.data.delivery_ids, [UUID_A]);
  assertEquals(r.data.dead_letter_ids, undefined);
});

Deno.test("delivery_ids: aceita 50 UUIDs (limite max)", () => {
  const ids = manyUuids(50);
  const r = BodySchema.safeParse({ delivery_ids: ids });
  assert(r.success, JSON.stringify(r));
  assertEquals(r.data.delivery_ids?.length, 50);
});

Deno.test("delivery_id (singular) é normalizado para array de 1", () => {
  const r = BodySchema.safeParse({ delivery_id: UUID_A });
  assert(r.success, JSON.stringify(r));
  assertEquals(r.data.delivery_ids, [UUID_A]);
});

// ────────────────────────────────────────────────────────────────────
// ACCEPTS — dead_letter_ids (simétrico)
// ────────────────────────────────────────────────────────────────────

Deno.test("dead_letter_ids: aceita 1 UUID válido", () => {
  const r = BodySchema.safeParse({ dead_letter_ids: [UUID_A] });
  assert(r.success, JSON.stringify(r));
  assertEquals(r.data.dead_letter_ids, [UUID_A]);
  assertEquals(r.data.delivery_ids, undefined);
});

Deno.test("dead_letter_ids: aceita 50 UUIDs (limite max)", () => {
  const ids = manyUuids(50);
  const r = BodySchema.safeParse({ dead_letter_ids: ids });
  assert(r.success, JSON.stringify(r));
  assertEquals(r.data.dead_letter_ids?.length, 50);
});

Deno.test("dead_letter_id (singular) é normalizado para array de 1", () => {
  const r = BodySchema.safeParse({ dead_letter_id: UUID_A });
  assert(r.success, JSON.stringify(r));
  assertEquals(r.data.dead_letter_ids, [UUID_A]);
});

// ────────────────────────────────────────────────────────────────────
// REJECTS — exclusividade (XOR)
// ────────────────────────────────────────────────────────────────────

Deno.test("rejeita: ambos delivery_ids e dead_letter_ids presentes", () => {
  const r = BodySchema.safeParse({
    delivery_ids: [UUID_A],
    dead_letter_ids: [UUID_B],
  });
  assert(!r.success);
  assert(typeof r.error.flatten === "function");
});

Deno.test("rejeita: body vazio {}", () => {
  const r = BodySchema.safeParse({});
  assert(!r.success);
});

Deno.test("rejeita: nenhum campo conhecido", () => {
  const r = BodySchema.safeParse({ foo: "bar" });
  assert(!r.success);
});

Deno.test("rejeita: delivery_ids + dead_letter_id (singular do outro tipo)", () => {
  const r = BodySchema.safeParse({
    delivery_ids: [UUID_A],
    dead_letter_id: UUID_B,
  });
  assert(!r.success);
});

// ────────────────────────────────────────────────────────────────────
// REJECTS — limites e tipos
// ────────────────────────────────────────────────────────────────────

Deno.test("rejeita: delivery_ids vazio", () => {
  const r = BodySchema.safeParse({ delivery_ids: [] });
  assert(!r.success);
});

Deno.test("rejeita: delivery_ids com 51 UUIDs", () => {
  const r = BodySchema.safeParse({ delivery_ids: manyUuids(51) });
  assert(!r.success);
});

Deno.test("rejeita: delivery_ids com string não-UUID", () => {
  const r = BodySchema.safeParse({ delivery_ids: ["not-a-uuid"] });
  assert(!r.success);
});

Deno.test("rejeita: delivery_ids com mistura (49 válidos + 1 inválido)", () => {
  const ids = [...manyUuids(49), "broken"];
  const r = BodySchema.safeParse({ delivery_ids: ids });
  assert(!r.success);
  // O fieldErrors do Zod deve mencionar o caminho delivery_ids
  const flat = r.error.flatten();
  // Pelo menos um dos lados (fieldErrors ou formErrors) deve estar populado
  const hasErrors =
    Object.keys(flat.fieldErrors).length > 0 || flat.formErrors.length > 0;
  assert(hasErrors);
});

Deno.test("rejeita: delivery_ids como string (não-array)", () => {
  const r = BodySchema.safeParse({ delivery_ids: "not-an-array" });
  assert(!r.success);
});

Deno.test("rejeita: delivery_ids com números em vez de strings", () => {
  const r = BodySchema.safeParse({ delivery_ids: [123, 456] });
  assert(!r.success);
});

Deno.test("rejeita: dead_letter_ids vazio", () => {
  const r = BodySchema.safeParse({ dead_letter_ids: [] });
  assert(!r.success);
});

Deno.test("rejeita: dead_letter_ids com 51 UUIDs", () => {
  const r = BodySchema.safeParse({ dead_letter_ids: manyUuids(51) });
  assert(!r.success);
});

// ────────────────────────────────────────────────────────────────────
// flatten() sempre serializável (handler depende disso para o 400)
// ────────────────────────────────────────────────────────────────────

Deno.test("error.flatten() é serializável em JSON em todas as falhas", () => {
  const cases: unknown[] = [
    {},
    { delivery_ids: [] },
    { delivery_ids: ["bad"] },
    { delivery_ids: manyUuids(51) },
    { delivery_ids: [UUID_A], dead_letter_ids: [UUID_B] },
    { delivery_ids: 123 },
    null,
  ];
  for (const body of cases) {
    const r = BodySchema.safeParse(body);
    assert(!r.success, `esperado falha para ${JSON.stringify(body)}`);
    // não deve lançar
    const json = JSON.stringify(r.error.flatten());
    assert(json.length > 2, "flatten() deve produzir objeto não-vazio");
  }
});

// ────────────────────────────────────────────────────────────────────
// Sanity: múltiplos UUIDs distintos em delivery_ids
// ────────────────────────────────────────────────────────────────────

Deno.test("delivery_ids: aceita múltiplos UUIDs distintos", () => {
  const r = BodySchema.safeParse({ delivery_ids: [UUID_A, UUID_B, UUID_C] });
  assert(r.success, JSON.stringify(r));
  assertEquals(r.data.delivery_ids?.length, 3);
});
