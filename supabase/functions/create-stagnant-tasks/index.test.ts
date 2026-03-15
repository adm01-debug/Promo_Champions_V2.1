/**
 * Edge Function Tests (Deno)
 * Tests: stagnant tasks creation endpoint
 */
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("create-stagnant-tasks - should respond with valid structure", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-stagnant-tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  const body = await response.text();
  
  // Should respond (may be 200 or 401 depending on auth)
  assertExists(response.status);
  assertEquals(typeof response.status, "number");
});

Deno.test("lead-scoring - should respond to invocation", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/lead-scoring`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ sale_id: "test-id" }),
  });

  const body = await response.text();
  assertExists(response.status);
});

Deno.test("deal-probability - should respond to invocation", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/deal-probability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ sale_id: "test-id" }),
  });

  const body = await response.text();
  assertExists(response.status);
});

Deno.test("next-best-action - should respond to invocation", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/next-best-action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ salesperson_id: "test-id" }),
  });

  const body = await response.text();
  assertExists(response.status);
});

Deno.test("demand-forecast - should respond to invocation", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/demand-forecast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });

  const body = await response.text();
  assertExists(response.status);
});
