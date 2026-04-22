import { assert, assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handler } from "./index.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Probe {
  status: number;
  headerId: string | null;
  body: Record<string, unknown> | null;
}

async function callHandler(body: BodyInit | null, init: RequestInit = {}): Promise<Probe> {
  const req = new Request("http://localhost/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    ...init,
  });
  const res = await handler(req);
  const headerId = res.headers.get("X-Request-Id");
  const text = await res.text();
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = null;
  }
  return { status: res.status, headerId, body: parsed };
}

/** Asserts the canonical envelope: { requestId, error, dispatched, results }. */
function assertEnvelope(body: Record<string, unknown> | null, expectError: boolean): void {
  assert(body, "response must be JSON");
  assert("requestId" in body!, "envelope must include `requestId`");
  assert("error" in body!, "envelope must include `error` (null on success)");
  assert("dispatched" in body!, "envelope must include `dispatched`");
  assert("results" in body!, "envelope must include `results`");
  assertEquals(typeof body!.requestId, "string");
  assertEquals(typeof body!.dispatched, "number");
  assert(Array.isArray(body!.results), "results must be an array");
  if (expectError) {
    assert(typeof body!.error === "string" && (body!.error as string).length > 0, "error must be a non-empty string");
  } else {
    assertEquals(body!.error, null, "error must be null on success");
  }
}

Deno.test("400 validation error: canonical envelope + matching requestId", async () => {
  const { status, headerId, body } = await callHandler(JSON.stringify({}));
  assertEquals(status, 400, "missing event must return 400");
  assert(headerId, "X-Request-Id header must be present");
  assertMatch(headerId!, UUID_RE, "header requestId must be a UUID");
  assertEnvelope(body, true);
  assertEquals(body!.requestId, headerId, "body.requestId must match X-Request-Id header");
  assertEquals(body!.dispatched, 0, "errors must report dispatched=0");
  assertEquals((body!.results as unknown[]).length, 0, "errors must report results=[]");
});

Deno.test("500 fatal error: canonical envelope + matching requestId", async () => {
  // Malformed JSON makes req.json() throw → caught by the dispatcher's catch block.
  const { status, headerId, body } = await callHandler("not-json{");
  assertEquals(status, 500, "malformed body must return 500 from the catch block");
  assert(headerId, "X-Request-Id header must be present on errors");
  assertMatch(headerId!, UUID_RE, "header requestId must be a UUID");
  assertEnvelope(body, true);
  assertEquals(body!.requestId, headerId, "body.requestId must match X-Request-Id header on 500");
  assertEquals(body!.dispatched, 0);
  assertEquals((body!.results as unknown[]).length, 0);
});

Deno.test("each invocation gets a fresh requestId (no leakage between calls)", async () => {
  const a = await callHandler(JSON.stringify({}));
  const b = await callHandler(JSON.stringify({}));
  assert(a.headerId && b.headerId);
  assertEquals((a.body as { requestId: string }).requestId, a.headerId);
  assertEquals((b.body as { requestId: string }).requestId, b.headerId);
  assert(a.headerId !== b.headerId, "two distinct invocations must produce distinct requestIds");
});
