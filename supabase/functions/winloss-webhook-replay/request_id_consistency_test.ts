import { assert, assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handler } from "./index.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Probe {
  status: number;
  headerId: string | null;
  bodyId: string | null;
}

async function callHandler(
  body: BodyInit | null,
  init: RequestInit = {},
): Promise<Probe> {
  const req = new Request("http://localhost/replay", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    body,
    ...init,
  });
  const res = await handler(req);
  const headerId = res.headers.get("X-Request-Id");
  const text = await res.text();
  let bodyId: string | null = null;
  try {
    const parsed = JSON.parse(text);
    bodyId = typeof parsed.requestId === "string" ? parsed.requestId : null;
  } catch {
    bodyId = null;
  }
  return { status: res.status, headerId, bodyId };
}

// 401: no Authorization header → handler short-circuits before any DB or env work.
Deno.test("401 unauthorized (missing bearer): requestId matches in header and body", async () => {
  const { status, headerId, bodyId } = await callHandler(JSON.stringify({}));
  assertEquals(status, 401, "missing bearer must return 401");
  assert(headerId, "X-Request-Id header must be present on 401");
  assert(bodyId, "JSON error body must contain requestId on 401");
  assertMatch(headerId!, UUID_RE, "header requestId must be a UUID");
  assertEquals(bodyId, headerId, "body.requestId must match X-Request-Id header on 401");
});

Deno.test("401 unauthorized (non-bearer scheme): requestId matches in header and body", async () => {
  const { status, headerId, bodyId } = await callHandler(JSON.stringify({}), {
    headers: { Authorization: "Basic anything" },
  });
  assertEquals(status, 401, "non-bearer scheme must return 401");
  assert(headerId && bodyId);
  assertMatch(headerId!, UUID_RE);
  assertEquals(bodyId, headerId);
});

// CORS preflight is the only response without a requestId (no body either) — verify it stays clean.
Deno.test("OPTIONS preflight returns no requestId artifacts", async () => {
  const req = new Request("http://localhost/replay", { method: "OPTIONS" });
  const res = await handler(req);
  await res.text();
  assertEquals(res.headers.get("X-Request-Id"), null, "preflight must not carry an X-Request-Id");
});

Deno.test("each invocation gets a fresh requestId (no leakage between calls)", async () => {
  const a = await callHandler(JSON.stringify({}));
  const b = await callHandler(JSON.stringify({}));
  assert(a.headerId && b.headerId, "both invocations must produce a requestId");
  assertEquals(a.bodyId, a.headerId);
  assertEquals(b.bodyId, b.headerId);
  assert(a.headerId !== b.headerId, "two distinct invocations must produce distinct requestIds");
});
