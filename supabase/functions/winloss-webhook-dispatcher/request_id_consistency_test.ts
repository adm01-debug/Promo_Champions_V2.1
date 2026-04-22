import { assert, assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handler } from "./index.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function callHandler(body: BodyInit | null, init: RequestInit = {}): Promise<{
  status: number;
  headerId: string | null;
  bodyId: string | null;
}> {
  const req = new Request("http://localhost/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

Deno.test("400 validation error: requestId is the same in header and body", async () => {
  const { status, headerId, bodyId } = await callHandler(JSON.stringify({}));
  assertEquals(status, 400, "missing event must return 400");
  assert(headerId, "X-Request-Id header must be present");
  assert(bodyId, "JSON body must contain requestId");
  assertMatch(headerId!, UUID_RE, "header requestId must be a UUID");
  assertEquals(bodyId, headerId, "body.requestId must match X-Request-Id header");
});

Deno.test("500 fatal error: requestId is the same in header and body", async () => {
  // Malformed JSON makes req.json() throw → caught by the dispatcher's catch block.
  const { status, headerId, bodyId } = await callHandler("not-json{");
  assertEquals(status, 500, "malformed body must return 500 from the catch block");
  assert(headerId, "X-Request-Id header must be present on errors");
  assert(bodyId, "JSON error body must contain requestId");
  assertMatch(headerId!, UUID_RE, "header requestId must be a UUID");
  assertEquals(bodyId, headerId, "body.requestId must match X-Request-Id header on 500");
});

Deno.test("each invocation gets a fresh requestId (no leakage between calls)", async () => {
  const a = await callHandler(JSON.stringify({}));
  const b = await callHandler(JSON.stringify({}));
  assert(a.headerId && b.headerId);
  assertEquals(a.bodyId, a.headerId);
  assertEquals(b.bodyId, b.headerId);
  assert(a.headerId !== b.headerId, "two distinct invocations must produce distinct requestIds");
});
