import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {
  dispatchOne,
  type Subscription,
  type DispatchDeps,
  type DeliveryRow,
} from './retry.ts';

const SUB: Subscription = {
  id: 'sub-fuzz',
  url: 'https://fuzz.test/hook',
  events: ['x'],
  secret: null,
};

function makeHarness() {
  const deliveries: DeliveryRow[] = [];
  const deps: DispatchDeps = {
    fetchFn: (() => Promise.resolve(new Response('ok', { status: 200 }))) as typeof fetch,
    insertDelivery: row => {
      deliveries.push(row);
      return Promise.resolve();
    },
    sleep: () => Promise.resolve(),
    updateSubscription: () => Promise.resolve(),
    now: () => 0,
    rand: () => 0,
  };
  return { deps, deliveries };
}

// ─────────────────── Mass Fuzzing Scenarios ───────────────────

Deno.test('fuzz: thousands of randomized payloads', async () => {
  const { deps } = makeHarness();

  // Generating 1000 variations of payloads
  for (let i = 0; i < 1000; i++) {
    const payload = {
      event: i % 10 === 0 ? null : i % 5 === 0 ? '' : 'event_' + i,
      data: {
        id: i,
        nested: { val: 'x'.repeat(i % 100) },
        mixed: [1, '2', { three: 3 }],
        nullField: i % 3 === 0 ? null : undefined,
        largeNum: Math.pow(10, i % 10),
      },
      __request_id: i % 100 === 0 ? 'not-a-uuid' : undefined,
    };

    // @ts-expect-error: testing invalid runtime payload
    const result = await dispatchOne(SUB, payload, deps);
    assert(result, `Failed at execution ${i}`);
    // Even with malformed payloads, dispatchOne should complete without crashing
    // (it defaults missing fields or handles them as strings)
  }
});

Deno.test('fuzz: payload with extreme characters', async () => {
  const { deps } = makeHarness();
  const extremeInputs = [
    '<script>alert("xss")</script>',
    "'; DROP TABLE users; --",
    '👋🌍🚀',
    '\x00\x01\x02',
    'A'.repeat(5000),
  ];

  for (const input of extremeInputs) {
    const result = await dispatchOne(SUB, { event: 'x', data: input }, deps);
    assertEquals(result.succeeded, true);
  }
});

Deno.test('fuzz: edge case numbers', async () => {
  const { deps } = makeHarness();
  const nums = [0, -1, NaN, Infinity, -Infinity, 1e20];

  for (const n of nums) {
    const result = await dispatchOne(SUB, { event: 'x', val: n }, deps);
    assertEquals(result.succeeded, true);
  }
});
