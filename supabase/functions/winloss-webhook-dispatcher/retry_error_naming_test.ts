// Determinístico: rand=()=>0, sleep no-op. Sem Math.random.
// Foco: pareamento exato (name, message) → error_message em CADA delivery,
// para AbortError e TimeoutError lado a lado.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  type DeadLetterEntry,
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
  deadLetters: DeadLetterEntry[];
}

function makeHarness(
  fetchImpl: (attempt: number) => Response | Promise<Response>,
  opts: { withDeadLetter?: boolean } = {},
): Harness {
  let attempt = 0;
  const deliveries: DeliveryRow[] = [];
  const deadLetters: DeadLetterEntry[] = [];
  const deps: DispatchDeps = {
    fetchFn: ((_u: string, _i?: RequestInit) => {
      attempt += 1;
      return Promise.resolve(fetchImpl(attempt));
    }) as typeof fetch,
    sleep: () => Promise.resolve(),
    insertDelivery: (row) => { deliveries.push(row); return Promise.resolve(); },
    updateSubscription: () => Promise.resolve(),
    onDeadLetter: opts.withDeadLetter
      ? (entry) => { deadLetters.push(entry); return Promise.resolve(); }
      : undefined,
    now: () => 0,
    rand: () => 0,
  };
  return { deps, deliveries, deadLetters };
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

// ───────────────────────── Dead-letter após 3 AbortError ─────────────────────────

Deno.test(
  "DLQ após 3 AbortError: last_error exato, attempts=3 e payload preservado (deep-eq + identity + chaves __*)",
  async () => {
    const MSG = "aborted by deadline";
    const payload = {
      event: "x",
      data: { foo: 1, nested: [1, 2] },
      __dispatch_id: "trace-abc",
      __replay: true,
    };

    const h = makeHarness(
      () => { throw makeNamedError("AbortError", MSG); },
      { withDeadLetter: true },
    );
    const r = await dispatchOne(SUB, payload, h.deps);

    // Resultado geral
    assertEquals(r.succeeded, false);
    assertEquals(r.attempts, MAX_ATTEMPTS);
    assertEquals(r.error, `AbortError: ${MSG}`);

    // DLQ chamada exatamente 1×
    assertEquals(h.deadLetters.length, 1);
    const entry = h.deadLetters[0];

    // Campos da entry
    assertEquals(entry.subscription_id, SUB.id);
    assertEquals(entry.event, "x");
    assertEquals(entry.attempts, MAX_ATTEMPTS);
    assertEquals(entry.last_status, 0);
    assertEquals(entry.last_error, `AbortError: ${MSG}`);
    assert(typeof entry.total_latency_ms === "number");
    assert(entry.total_latency_ms >= 0);

    // Payload preservado: deep-eq
    assertEquals(entry.payload, payload);
    // Identidade referencial — retry.ts repassa o objeto original sem clonar
    assert(entry.payload === payload, "DLQ recebe o mesmo objeto payload (sem clone)");
    // Chaves internas __* mantidas (DLQ recebe payload NÃO sanitizado)
    assertEquals(entry.payload.__dispatch_id, "trace-abc");
    assertEquals(entry.payload.__replay, true);
    // Estrutura aninhada intacta
    assertEquals((entry.payload.data as { foo: number; nested: number[] }).nested, [1, 2]);

    // Coerência: DLQ.last_error == error_message da última delivery
    assertEquals(h.deliveries.length, MAX_ATTEMPTS);
    assertEquals(h.deliveries[MAX_ATTEMPTS - 1].error_message, entry.last_error);
  },
);

// ───────────────────── Falhas mistas: Abort + Timeout + rede ─────────────────────

Deno.test(
  "falhas mistas Abort→Timeout→Network: cada delivery persiste seu próprio error_message com name+message corretos",
  async () => {
    const ABORT_MSG = "aborted by deadline";
    const TIMEOUT_MSG = "signal timed out after 8000ms";
    const NET_MSG = "tcp connect ECONNREFUSED 10.0.0.1:443";

    const h = makeHarness((attempt) => {
      if (attempt === 1) throw makeNamedError("AbortError", ABORT_MSG);
      if (attempt === 2) throw makeNamedError("TimeoutError", TIMEOUT_MSG);
      // Erro de rede genérico: TypeError é o que `fetch` lança no Deno em falhas de conexão
      throw makeNamedError("TypeError", NET_MSG);
    });
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    assertEquals(r.succeeded, false);
    assertEquals(r.attempts, MAX_ATTEMPTS);
    assertEquals(r.status, 0);
    assertEquals(r.error, `TypeError: ${NET_MSG}`);
    assertEquals(h.deliveries.length, MAX_ATTEMPTS);

    // Por-tentativa: name + message + status=0 + succeeded=false
    const expected = [
      { name: "AbortError", msg: ABORT_MSG },
      { name: "TimeoutError", msg: TIMEOUT_MSG },
      { name: "TypeError", msg: NET_MSG },
    ];
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const d = h.deliveries[i];
      assertEquals(d.attempt, i + 1, `delivery ${i + 1} attempt`);
      assertEquals(d.status, 0, `delivery ${i + 1} status=0 (sem HTTP response)`);
      assertEquals(d.succeeded, false, `delivery ${i + 1} succeeded=false`);
      assertEquals(
        d.error_message,
        `${expected[i].name}: ${expected[i].msg}`,
        `delivery ${i + 1} error_message exato`,
      );
      const parts = splitErrorMessage(d.error_message!);
      assertEquals(parts.name, expected[i].name, `delivery ${i + 1} name isolado`);
      assertEquals(parts.message, expected[i].msg, `delivery ${i + 1} message isolada`);
    }

    // Asserts cruzados: cada delivery NÃO tem o erro das outras (zero cross-talk)
    assert(!h.deliveries[0].error_message!.includes("TimeoutError"));
    assert(!h.deliveries[0].error_message!.includes("TypeError"));
    assert(!h.deliveries[1].error_message!.includes("AbortError"));
    assert(!h.deliveries[1].error_message!.includes("TypeError"));
    assert(!h.deliveries[2].error_message!.includes("AbortError"));
    assert(!h.deliveries[2].error_message!.includes("TimeoutError"));
  },
);

Deno.test(
  "erro de rede (TypeError) persistente × 3 → error_message 'TypeError: <msg>' em todas as deliveries",
  async () => {
    const MSG = "error sending request: connection closed before message completed";
    const h = makeHarness(() => { throw makeNamedError("TypeError", MSG); });
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    assertEquals(r.succeeded, false);
    assertEquals(r.attempts, MAX_ATTEMPTS);
    assertEquals(r.error, `TypeError: ${MSG}`);
    assertEquals(h.deliveries.length, MAX_ATTEMPTS);

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const d = h.deliveries[i];
      assertEquals(d.error_message, `TypeError: ${MSG}`, `delivery ${i + 1}`);
      assertEquals(d.status, 0);
      assertEquals(d.succeeded, false);
      const parts = splitErrorMessage(d.error_message!);
      assertEquals(parts.name, "TypeError");
      assertEquals(parts.message, MSG);
    }
    // Sem cross-talk com erros de timing
    assert(h.deliveries.every((d) => !d.error_message!.startsWith("AbortError")));
    assert(h.deliveries.every((d) => !d.error_message!.startsWith("TimeoutError")));
  },
);

Deno.test(
  "rede falha 2× e recupera no 3º (200) → error_message é TypeError nos 2 primeiros e null no sucesso",
  async () => {
    const NET_MSGS = [
      "tcp connect ECONNREFUSED",
      "error sending request: connection reset by peer",
    ];
    const h = makeHarness((attempt) => {
      if (attempt < 3) throw makeNamedError("TypeError", NET_MSGS[attempt - 1]);
      return new Response("ok", { status: 200 });
    });
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    assertEquals(r.succeeded, true);
    assertEquals(r.attempts, 3);
    assertEquals(r.status, 200);
    assertEquals(r.error, null);
    assertEquals(h.deliveries.length, 3);

    for (let i = 0; i < 2; i++) {
      const d = h.deliveries[i];
      assertEquals(d.error_message, `TypeError: ${NET_MSGS[i]}`, `delivery ${i + 1} error_message`);
      assertEquals(d.status, 0);
      assertEquals(d.succeeded, false);
      const parts = splitErrorMessage(d.error_message!);
      assertEquals(parts.name, "TypeError");
      assertEquals(parts.message, NET_MSGS[i]);
    }

    // Sucesso na 3ª
    assertEquals(h.deliveries[2].error_message, null);
    assertEquals(h.deliveries[2].status, 200);
    assertEquals(h.deliveries[2].succeeded, true);

    // Exatamente 1 delivery com null (sucesso) e 2 com prefixo TypeError
    assertEquals(h.deliveries.filter((d) => d.error_message === null).length, 1);
    assertEquals(
      h.deliveries.filter((d) => d.error_message?.startsWith("TypeError: ")).length,
      2,
    );
  },
);
