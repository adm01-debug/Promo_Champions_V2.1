import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { DispatcherPayloadSchema } from "./schema.ts";

const UUID = "11111111-1111-4111-8111-111111111111";

// ─── ACCEPTS ─────────────────────────────────────────────────────────

Deno.test("accepts a minimal valid payload (event only)", () => {
  const r = DispatcherPayloadSchema.safeParse({ event: "ping" });
  assert(r.success, JSON.stringify(r));
  assertEquals(r.data.event, "ping");
});

Deno.test("accepts dotted/dashed/underscored event names", () => {
  for (const ev of ["winloss.deal.lost", "deal_won", "lead-created", "PingPong"]) {
    const r = DispatcherPayloadSchema.safeParse({ event: ev });
    assert(r.success, `failed for: ${ev}`);
  }
});

Deno.test("accepts all reserved fields with valid UUIDs", () => {
  const r = DispatcherPayloadSchema.safeParse({
    event: "ping",
    __target_subscription_id: UUID,
    __replay_of: UUID,
    __request_id: UUID,
  });
  assert(r.success, JSON.stringify(r));
  assertEquals(r.data.__request_id, UUID);
});

Deno.test("preserves arbitrary subscriber fields (passthrough)", () => {
  const r = DispatcherPayloadSchema.safeParse({
    event: "ping",
    deal_id: "abc",
    nested: { foo: 1 },
    arr: [1, 2, 3],
  });
  assert(r.success);
  // passthrough preserves unknown keys
  assertEquals((r.data as Record<string, unknown>).deal_id, "abc");
  assertEquals(((r.data as Record<string, unknown>).nested as Record<string, unknown>).foo, 1);
});

Deno.test("trims whitespace around event", () => {
  const r = DispatcherPayloadSchema.safeParse({ event: "  ping  " });
  assert(r.success);
  assertEquals(r.data.event, "ping");
});

// ─── REJECTS ─────────────────────────────────────────────────────────

Deno.test("rejects missing event", () => {
  const r = DispatcherPayloadSchema.safeParse({});
  assert(!r.success);
});

Deno.test("rejects empty event string", () => {
  const r = DispatcherPayloadSchema.safeParse({ event: "" });
  assert(!r.success);
});

Deno.test("rejects whitespace-only event", () => {
  const r = DispatcherPayloadSchema.safeParse({ event: "   " });
  assert(!r.success);
});

Deno.test("rejects non-string event (number)", () => {
  const r = DispatcherPayloadSchema.safeParse({ event: 123 });
  assert(!r.success);
});

Deno.test("rejects non-string event (null)", () => {
  const r = DispatcherPayloadSchema.safeParse({ event: null });
  assert(!r.success);
});

Deno.test("rejects event with disallowed chars (spaces, slashes, unicode)", () => {
  for (const bad of ["ping pong", "deal/won", "💥boom", "deal\nwon"]) {
    const r = DispatcherPayloadSchema.safeParse({ event: bad });
    assert(!r.success, `expected reject for: ${JSON.stringify(bad)}`);
  }
});

Deno.test("rejects event longer than 200 chars", () => {
  const r = DispatcherPayloadSchema.safeParse({ event: "a".repeat(201) });
  assert(!r.success);
});

Deno.test("rejects malformed __target_subscription_id", () => {
  const r = DispatcherPayloadSchema.safeParse({
    event: "ping",
    __target_subscription_id: "not-a-uuid",
  });
  assert(!r.success);
});

Deno.test("rejects malformed __replay_of", () => {
  const r = DispatcherPayloadSchema.safeParse({
    event: "ping",
    __replay_of: "1234",
  });
  assert(!r.success);
});

Deno.test("rejects malformed __request_id", () => {
  const r = DispatcherPayloadSchema.safeParse({
    event: "ping",
    __request_id: "abc",
  });
  assert(!r.success);
});

Deno.test("error.flatten() is JSON-serializable for all rejection cases", () => {
  const cases: unknown[] = [
    {},
    { event: "" },
    { event: 123 },
    { event: "ping", __replay_of: "bad" },
    { event: "a b" },
  ];
  for (const body of cases) {
    const r = DispatcherPayloadSchema.safeParse(body);
    assert(!r.success);
    const json = JSON.stringify(r.error.flatten());
    assert(json.length > 2);
  }
});
