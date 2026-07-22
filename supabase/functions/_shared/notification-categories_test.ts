// Testes para notification-categories guard.
// Cobrem: categorias/prioridades válidas, rejeição, batch parcial e split-based helper.
import { assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  notificationCategorySchema,
  partitionNotificationBatch,
  validateNotificationBatch,
} from "./notification-categories.ts";

const uuid = "11111111-1111-4111-8111-111111111111";

function baseRow(overrides: Record<string, unknown> = {}) {
  return {
    user_id: uuid,
    type: "system",
    category: "system",
    priority: "high",
    title: "T",
    message: "M",
    ...overrides,
  };
}

Deno.test("all allowed categories parse", () => {
  for (const c of NOTIFICATION_CATEGORIES) {
    assertEquals(notificationCategorySchema.parse(c), c);
  }
});

Deno.test("all allowed priorities appear in schema", () => {
  assertEquals(NOTIFICATION_PRIORITIES.length, 4);
});

Deno.test("validateNotificationBatch accepts a happy-path batch", () => {
  const rows = [baseRow(), baseRow({ category: "goals", priority: "low" })];
  const out = validateNotificationBatch(rows);
  assertEquals(out.length, 2);
  assertEquals(out[0].category, "system");
});

Deno.test("validateNotificationBatch rejects invalid category with row index", () => {
  const rows = [baseRow(), baseRow({ category: "not-a-real-category" })];
  const err = assertThrows(() => validateNotificationBatch(rows), Error);
  const msg = (err as Error).message;
  if (!msg.includes("row[1]")) throw new Error(`expected row[1] in message, got: ${msg}`);
  if (!msg.includes("category")) throw new Error(`expected category in message, got: ${msg}`);
});

Deno.test("validateNotificationBatch rejects invalid priority", () => {
  const rows = [baseRow({ priority: "urgent" })];
  assertThrows(() => validateNotificationBatch(rows), Error, "priority");
});

Deno.test("validateNotificationBatch rejects invalid uuid", () => {
  const rows = [baseRow({ user_id: "not-a-uuid" })];
  assertThrows(() => validateNotificationBatch(rows), Error, "user_id");
});

Deno.test("schema tolerates omitted category/priority (DB defaults apply)", () => {
  const { valid, invalid } = partitionNotificationBatch([
    { user_id: uuid, type: "info", title: "sem cat/prio" },
  ]);
  assertEquals(invalid.length, 0);
  assertEquals(valid.length, 1);
});

Deno.test("partitionNotificationBatch separates valid from invalid rows", () => {
  const rows = [
    baseRow(),
    baseRow({ category: "customer_success" }), // inválida
    baseRow({ user_id: "nope" }),               // inválida
    baseRow({ category: "team", priority: "critical" }),
  ];
  const { valid, invalid } = partitionNotificationBatch(rows);
  assertEquals(valid.length, 2);
  assertEquals(invalid.length, 2);
  assertEquals(invalid[0].index, 1);
  assertEquals(invalid[1].index, 2);
  if (!invalid[0].reason.includes("category")) throw new Error(invalid[0].reason);
  if (!invalid[1].reason.includes("user_id")) throw new Error(invalid[1].reason);
});

Deno.test("partitionNotificationBatch returns empty for empty input", () => {
  const { valid, invalid } = partitionNotificationBatch([]);
  assertEquals(valid.length, 0);
  assertEquals(invalid.length, 0);
});
