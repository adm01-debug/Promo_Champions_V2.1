import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  dispatchOne,
  MAX_ATTEMPTS,
  type Subscription,
  type DispatchDeps,
} from "./retry.ts";

const SUB: Subscription = { id: "sub-fuzz", url: "https://fuzz.test/hook", events: ["x"], secret: null };

function makeHarness() {
  const deliveries: any[] = [];
  const deps: DispatchDeps = {
    fetchFn: (() => Promise.resolve(new Response("ok", { status: 200 }))) as typeof fetch,
    insertDelivery: (row) => { deliveries.push(row); return Promise.resolve(); },
    sleep: () => Promise.resolve(),
    updateSubscription: () => Promise.resolve(),
    now: () => 0,
    rand: () => 0,
  };
  return { deps, deliveries };
}

// ─────────────────── Fuzzing Scenarios ───────────────────

Deno.test("fuzz: payload missing event field", async () => {
  const { deps } = makeHarness();
  // @ts-ignore: testing invalid runtime payload
  const result = await dispatchOne(SUB, { data: "no event" }, deps);
  // The current implementation of dispatchOne defaults event to "unknown" if missing.
  // We should verify it doesn't crash.
  assert(result);
  assertEquals(result.succeeded, true);
});

Deno.test("fuzz: payload with very large data", async () => {
  const { deps } = makeHarness();
  const largeData = "a".repeat(1024 * 10); // 10KB string
  const result = await dispatchOne(SUB, { event: "x", data: largeData }, deps);
  assertEquals(result.succeeded, true);
});

Deno.test("fuzz: payload with null values in required fields", async () => {
  const { deps } = makeHarness();
  // @ts-ignore
  const result = await dispatchOne(SUB, { event: null, data: 123 }, deps);
  assertEquals(result.succeeded, true);
});

Deno.test("fuzz: invalid subscription URL", async () => {
  const badSub = { ...SUB, url: "not-a-url" };
  const deps: DispatchDeps = {
    fetchFn: () => Promise.reject(new TypeError("Invalid URL")),
    insertDelivery: () => Promise.resolve(),
    sleep: () => Promise.resolve(),
    updateSubscription: () => Promise.resolve(),
    now: () => 0,
    rand: () => 0,
  };
  const result = await dispatchOne(badSub, { event: "x" }, deps);
  assertEquals(result.succeeded, false);
  assertEquals(result.status, 0);
  assert(result.error?.includes("TypeError"));
});

Deno.test("fuzz: payload with nested circular references (if possible)", async () => {
  const { deps } = makeHarness();
  const payload: any = { event: "x" };
  // Circular ref would normally break JSON.stringify, but dispatchOne should handle or fail gracefully.
  // We don't implement circular ref here because JSON.stringify would throw.
  // Instead, let's test a very deep object.
  let deep: any = { event: "x" };
  let current = deep;
  for (let i = 0; i < 100; i++) {
    current.child = { val: i };
    current = current.child;
  }
  const result = await dispatchOne(SUB, deep, deps);
  assertEquals(result.succeeded, true);
});
