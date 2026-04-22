// Determinístico: rand=()=>0, sleep no-op. Sem Math.random.
// Foco: pareamento exato (name, message) → error_message em CADA delivery,
// para AbortError e TimeoutError lado a lado.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  type DeliveryRow,
  type DispatchDeps,
  dispatchOne,
  MAX_ATTEMPTS,
  type Subscription,
} from "./retry.ts";

const SUB: Subscription = { id: "sub-en", url: "https://x.test/hook", events: ["x"], secret: null };
const PAYLOAD = { event: "x", data: { foo: 1 } };

interface Harness {
  deps: DispatchDeps;
  deliveries: DeliveryRow[];
}

function makeHarness(
  fetchImpl: (attempt: number) => Response | Promise<Response>,
): Harness {
  let attempt = 0;
  const deliveries: DeliveryRow[] = [];
  const deps: DispatchDeps = {
    fetchFn: ((_u: string, _i?: RequestInit) => {
      attempt += 1;
      return Promise.resolve(fetchImpl(attempt));
    }) as typeof fetch,
    sleep: () => Promise.resolve(),
    insertDelivery: (row) => { deliveries.push(row); return Promise.resolve(); },
    updateSubscription: () => Promise.resolve(),
    now: () => 0,
    rand: () => 0,
  };
  return { deps, deliveries };
}

function makeNamedError(name: string, message: string): Error {
  const e = new Error(message);
  e.name = name;
  return e;
}

/** Split "Name: message" preservando ":" extras na mensagem. */
function splitErrorMessage(em: string): { name: string; message: string } {
  const idx = em.indexOf(": ");
  assert(idx > 0, `error_message sem separador 'Name: ': ${em}`);
  return { name: em.slice(0, idx), message: em.slice(idx + 2) };
}

// ───────────────────────── AbortError ─────────────────────────

Deno.test("AbortError: mensagem fixa em todas as 3 tentativas → name+message exatos por delivery", async () => {
  const MSG = "The signal has been aborted";
  const h = makeHarness(() => { throw makeNamedError("AbortError", MSG); });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.attempts, MAX_ATTEMPTS);
  assertEquals(r.succeeded, false);
  assertEquals(h.deliveries.length, MAX_ATTEMPTS);

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const d = h.deliveries[i];
    assertEquals(d.error_message, `AbortError: ${MSG}`, `delivery ${i + 1} error_message`);
    assertEquals(d.succeeded, false);
    assertEquals(d.status, 0);
    const parts = splitErrorMessage(d.error_message!);
    assertEquals(parts.name, "AbortError");
    assertEquals(parts.message, MSG);
  }
  assertEquals(r.error, `AbortError: ${MSG}`);
});

Deno.test("AbortError: mensagem variando por tentativa → cada delivery reflete sua própria message", async () => {
  const MSGS = ["aborted #1", "aborted #2", "aborted #3"];
  const h = makeHarness((attempt) => { throw makeNamedError("AbortError", MSGS[attempt - 1]); });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.deliveries.length, MAX_ATTEMPTS);
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const d = h.deliveries[i];
    const parts = splitErrorMessage(d.error_message!);
    assertEquals(parts.name, "AbortError", `delivery ${i + 1} name`);
    assertEquals(parts.message, MSGS[i], `delivery ${i + 1} message`);
    assertEquals(d.error_message, `AbortError: ${MSGS[i]}`);
  }
  assertEquals(r.error, `AbortError: ${MSGS[MAX_ATTEMPTS - 1]}`);

  // sem cross-talk com TimeoutError
  assert(h.deliveries.every((d) => !d.error_message!.startsWith("TimeoutError")));
});

Deno.test("AbortError: mensagem vazia → fallback consistente, prefixo 'AbortError: ' em todas", async () => {
  const h = makeHarness(() => { throw makeNamedError("AbortError", ""); });
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.deliveries.length, MAX_ATTEMPTS);
  const first = h.deliveries[0].error_message!;
  assert(first.startsWith("AbortError: "), `prefixo esperado, got: ${first}`);
  for (const d of h.deliveries) {
    assertEquals(d.error_message, first, "todas as deliveries com mensagem vazia coincidem");
    const parts = splitErrorMessage(d.error_message!);
    assertEquals(parts.name, "AbortError");
    assert(parts.message.length > 0, "fallback de message não-vazio");
  }
});

// ───────────────────────── TimeoutError ─────────────────────────

Deno.test("TimeoutError: mensagem fixa em todas as 3 tentativas → name+message exatos por delivery", async () => {
  const MSG = "signal timed out after 8000ms";
  const h = makeHarness(() => { throw makeNamedError("TimeoutError", MSG); });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.attempts, MAX_ATTEMPTS);
  assertEquals(r.succeeded, false);
  assertEquals(h.deliveries.length, MAX_ATTEMPTS);

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const d = h.deliveries[i];
    assertEquals(d.error_message, `TimeoutError: ${MSG}`, `delivery ${i + 1} error_message`);
    assertEquals(d.succeeded, false);
    assertEquals(d.status, 0);
    const parts = splitErrorMessage(d.error_message!);
    assertEquals(parts.name, "TimeoutError");
    assertEquals(parts.message, MSG);
  }
  assertEquals(r.error, `TimeoutError: ${MSG}`);

  // sem cross-talk com AbortError
  assert(h.deliveries.every((d) => !d.error_message!.startsWith("AbortError")));
});

Deno.test("TimeoutError: mensagem variando por tentativa → cada delivery reflete sua própria message", async () => {
  const MSGS = ["deadline #1", "deadline #2", "deadline #3"];
  const h = makeHarness((attempt) => { throw makeNamedError("TimeoutError", MSGS[attempt - 1]); });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.deliveries.length, MAX_ATTEMPTS);
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const d = h.deliveries[i];
    const parts = splitErrorMessage(d.error_message!);
    assertEquals(parts.name, "TimeoutError", `delivery ${i + 1} name`);
    assertEquals(parts.message, MSGS[i], `delivery ${i + 1} message`);
    assertEquals(d.error_message, `TimeoutError: ${MSGS[i]}`);
  }
  assertEquals(r.error, `TimeoutError: ${MSGS[MAX_ATTEMPTS - 1]}`);
});

Deno.test("TimeoutError × 2 + 200 na 3ª → error_message reflete TimeoutError nas 2 falhas e null no sucesso", async () => {
  const MSGS = ["deadline #1", "deadline #2"];
  const h = makeHarness((attempt) => {
    if (attempt < 3) throw makeNamedError("TimeoutError", MSGS[attempt - 1]);
    return new Response("ok", { status: 200 });
  });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.attempts, 3);
  assertEquals(r.succeeded, true);
  assertEquals(r.status, 200);
  assertEquals(r.error, null);
  assertEquals(h.deliveries.length, 3);

  for (let i = 0; i < 2; i++) {
    const d = h.deliveries[i];
    const parts = splitErrorMessage(d.error_message!);
    assertEquals(parts.name, "TimeoutError");
    assertEquals(parts.message, MSGS[i]);
    assertEquals(d.succeeded, false);
    assertEquals(d.status, 0);
  }

  assertEquals(h.deliveries[2].error_message, null);
  assertEquals(h.deliveries[2].succeeded, true);
  assertEquals(h.deliveries[2].status, 200);

  const nullErrors = h.deliveries.filter((d) => d.error_message === null);
  assertEquals(nullErrors.length, 1);
  assertEquals(nullErrors[0].succeeded, true);
});
