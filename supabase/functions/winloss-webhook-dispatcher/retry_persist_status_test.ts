// Persistência por tentativa em winloss_webhook_deliveries quando o status varia.
// Bloco A — unidade (sempre roda): valida shape COMPLETO da DeliveryRow passada
//   a insertDelivery, em 4 cenários de status mutável entre tentativas.
// Bloco B — integração (opt-in via env): substitui insertDelivery por adapter
//   real contra a tabela e relê via SELECT.
//
// Determinístico: rand=()=>0, sleep no-op. Sem Math.random.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  type DeadLetterEntry,
  type DeliveryRow,
  type DispatchDeps,
  dispatchOne,
  MAX_ATTEMPTS,
  type Subscription,
} from "./retry.ts";

const SUB: Subscription = {
  id: "11111111-1111-4111-8111-111111111111",
  url: "https://x.test/hook",
  events: ["x"],
  secret: null,
};
const PAYLOAD = { event: "x", data: { foo: 1 } };

interface Harness {
  deps: DispatchDeps;
  deliveries: DeliveryRow[];
  deadLetters: DeadLetterEntry[];
}

function makeHarness(
  fetchImpl: (attempt: number) => Response | Promise<Response>,
  opts: { withDeadLetter?: boolean; insertDelivery?: (row: DeliveryRow) => Promise<void> } = {},
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
    insertDelivery: opts.insertDelivery ?? ((row) => {
      deliveries.push(row);
      return Promise.resolve();
    }),
    updateSubscription: () => Promise.resolve(),
    onDeadLetter: opts.withDeadLetter
      ? (entry) => { deadLetters.push(entry); return Promise.resolve(); }
      : undefined,
    now: () => 0,
    rand: () => 0,
  };
  return { deps, deliveries, deadLetters };
}

const EXPECTED_KEYS = [
  "attempt",
  "duration_ms",
  "error_message",
  "event",
  "payload",
  "status",
  "subscription_id",
  "succeeded",
] as const;

function assertRowShape(row: DeliveryRow, label: string) {
  const keys = Object.keys(row).sort();
  assertEquals(keys, [...EXPECTED_KEYS], `${label}: chaves de DeliveryRow devem bater 1:1 com colunas da tabela`);
  assertEquals(typeof row.subscription_id, "string", `${label}: subscription_id string`);
  assertEquals(typeof row.event, "string", `${label}: event string`);
  assertEquals(typeof row.attempt, "number", `${label}: attempt number`);
  assertEquals(typeof row.status, "number", `${label}: status number`);
  assertEquals(typeof row.duration_ms, "number", `${label}: duration_ms number`);
  assertEquals(typeof row.succeeded, "boolean", `${label}: succeeded boolean`);
  assert(row.duration_ms >= 0, `${label}: duration_ms ≥ 0`);
  assert(row.error_message === null || typeof row.error_message === "string", `${label}: error_message null|string`);
  assert(row.payload && typeof row.payload === "object", `${label}: payload object`);
}

// ───────────────────────── Bloco A — Unidade ─────────────────────────

Deno.test("persist status: 502→503→200 → 3 linhas com shape completo e tuplas exatas", async () => {
  const responses = [
    new Response("bad gateway", { status: 502 }),
    new Response("unavailable", { status: 503 }),
    new Response("ok", { status: 200 }),
  ];
  const h = makeHarness((n) => responses[n - 1]);
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, true);
  assertEquals(r.status, 200);
  assertEquals(h.deliveries.length, 3);

  const expected: Array<[number, number, boolean]> = [
    [1, 502, false],
    [2, 503, false],
    [3, 200, true],
  ];
  for (let i = 0; i < 3; i++) {
    const row = h.deliveries[i];
    assertRowShape(row, `linha ${i + 1}`);
    const [attempt, status, succeeded] = expected[i];
    assertEquals(row.attempt, attempt);
    assertEquals(row.status, status);
    assertEquals(row.succeeded, succeeded);
    assertEquals(row.error_message, null, `linha ${i + 1}: HTTP error não popula error_message`);
    assertEquals(row.subscription_id, SUB.id);
    assertEquals(row.event, PAYLOAD.event);
    // payload por identidade (sem clone)
    assert(row.payload === PAYLOAD, `linha ${i + 1}: payload por identidade`);
  }
});

Deno.test("persist status: 500→502→503 (falha persistente mutável) → 3 linhas + DLQ.last_status=503", async () => {
  const responses = [500, 502, 503];
  const h = makeHarness(
    (n) => new Response("e", { status: responses[n - 1] }),
    { withDeadLetter: true },
  );
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, false);
  assertEquals(r.attempts, MAX_ATTEMPTS);
  assertEquals(r.status, 503);
  assertEquals(h.deliveries.length, 3);

  responses.forEach((expected, i) => {
    const row = h.deliveries[i];
    assertRowShape(row, `linha ${i + 1}`);
    assertEquals(row.attempt, i + 1);
    assertEquals(row.status, expected);
    assertEquals(row.succeeded, false);
    assertEquals(row.error_message, null);
  });

  // Coerência com DLQ
  assertEquals(h.deadLetters.length, 1);
  assertEquals(h.deadLetters[0].last_status, 503);
});

Deno.test("persist status: 502→200 (recovery na 2ª) → exatamente 2 linhas, sem 3ª spuria", async () => {
  const responses = [502, 200];
  const h = makeHarness((n) => new Response("x", { status: responses[n - 1] }));
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, true);
  assertEquals(r.attempts, 2);
  assertEquals(h.deliveries.length, 2);

  assertRowShape(h.deliveries[0], "linha 1");
  assertEquals(h.deliveries[0].attempt, 1);
  assertEquals(h.deliveries[0].status, 502);
  assertEquals(h.deliveries[0].succeeded, false);

  assertRowShape(h.deliveries[1], "linha 2");
  assertEquals(h.deliveries[1].attempt, 2);
  assertEquals(h.deliveries[1].status, 200);
  assertEquals(h.deliveries[1].succeeded, true);

  assert(!h.deliveries.some((d) => d.attempt === 3), "nenhuma 3ª inserção spuria após sucesso");
});

Deno.test("persist status: 502→503→504 (3 falhas HTTP distintas) → tuplas exatas, error_message=null em todas", async () => {
  const responses = [502, 503, 504];
  const h = makeHarness((n) => new Response("e", { status: responses[n - 1] }));
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, false);
  assertEquals(r.status, 504);
  assertEquals(r.error, null, "HTTP errors não geram lastError no result");
  assertEquals(h.deliveries.length, 3);

  responses.forEach((expected, i) => {
    const row = h.deliveries[i];
    assertRowShape(row, `linha ${i + 1}`);
    assertEquals(row.attempt, i + 1);
    assertEquals(row.status, expected);
    assertEquals(row.succeeded, false);
    assertEquals(row.error_message, null);
  });
});

// ───────────────────────── Bloco B — Integração real ─────────────────────────

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const HAS_DB = Boolean(SUPABASE_URL) && Boolean(SERVICE_ROLE_KEY);

Deno.test({
  name: "persist status (DB real): 502→503→200 → 3 linhas em winloss_webhook_deliveries com tuplas exatas",
  ignore: !HAS_DB,
  async fn() {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Fixture: cria subscription real (FK exige existência)
    const stamp = Date.now();
    const subInsert = await sb
      .from("winloss_webhook_subscriptions")
      .insert({
        url: `https://test.invalid/persist-status-${stamp}`,
        events: ["test.persist"],
        active: false,
        created_by: "00000000-0000-4000-8000-000000000001",
      })
      .select("id")
      .single();
    if (subInsert.error) throw subInsert.error;
    const subscriptionId: string = subInsert.data.id;
    const event = `test.persist.status.varies.${stamp}`;

    try {
      const responses = [
        new Response("bad gateway", { status: 502 }),
        new Response("unavailable", { status: 503 }),
        new Response("ok", { status: 200 }),
      ];
      let attempt = 0;
      const deps: DispatchDeps = {
        fetchFn: ((_u: string) => {
          attempt += 1;
          return Promise.resolve(responses[attempt - 1]);
        }) as typeof fetch,
        sleep: () => Promise.resolve(),
        insertDelivery: async (row) => {
          const { error } = await sb.from("winloss_webhook_deliveries").insert(row);
          if (error) throw error;
        },
        updateSubscription: () => Promise.resolve(),
        rand: () => 0,
      };

      const sub: Subscription = { id: subscriptionId, url: subInsert.data.id, events: [event], secret: null };
      const payload = { event, data: { foo: 1 } };

      const r = await dispatchOne(sub, payload, deps);
      assertEquals(r.succeeded, true);
      assertEquals(r.status, 200);

      // SELECT real
      const { data: rows, error: selErr } = await sb
        .from("winloss_webhook_deliveries")
        .select("attempt, status, succeeded, error_message, created_at, event, subscription_id")
        .eq("subscription_id", subscriptionId)
        .eq("event", event)
        .order("attempt", { ascending: true });
      if (selErr) throw selErr;

      assertEquals(rows?.length, 3, "3 linhas persistidas");
      const tuples = (rows ?? []).map((r) => [r.attempt, r.status, r.succeeded] as const);
      assertEquals(tuples, [
        [1, 502, false],
        [2, 503, false],
        [3, 200, true],
      ]);

      for (const r of rows ?? []) {
        assertEquals(r.error_message, null);
        assertEquals(r.subscription_id, subscriptionId);
        assertEquals(r.event, event);
      }

      // created_at monotonicamente crescente (ou ≥ — resolução de timestamp)
      const ts = (rows ?? []).map((r) => new Date(r.created_at as string).getTime());
      for (let i = 1; i < ts.length; i++) {
        assert(ts[i] >= ts[i - 1], `created_at[${i}] (${ts[i]}) ≥ created_at[${i - 1}] (${ts[i - 1]})`);
      }
    } finally {
      // Cleanup: ON DELETE CASCADE remove deliveries automaticamente
      await sb.from("winloss_webhook_subscriptions").delete().eq("id", subscriptionId);
    }
  },
});
