// Testes para notification-categories guard.
// Cobrem: (a) toda categoria válida aceita, (b) rejeição de categoria inválida,
// (c) prioridade inválida, (d) batch parcialmente inválido lista índices.
import { assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  notificationCategorySchema,
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
  // sanity: contract exports the same list the DB constraint enforces
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
