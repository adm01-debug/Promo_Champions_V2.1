import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const URL_FN = `${SUPABASE_URL}/functions/v1/start-race-season`;

Deno.test("start-race-season: OPTIONS preflight", async () => {
  const r = await fetch(URL_FN, { method: "OPTIONS" });
  await r.text();
  assertEquals(r.status, 200);
});

Deno.test("start-race-season: no auth → 401", async () => {
  const r = await fetch(URL_FN, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ name: "x", start_date: "2026-01-01", end_date: "2026-02-01", goal_amount: 100 }),
  });
  const body = await r.json();
  assertEquals(r.status, 401);
  assert(body.error);
});

Deno.test("start-race-season: invalid token → 401", async () => {
  const r = await fetch(URL_FN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: "Bearer not.a.real.jwt",
    },
    body: JSON.stringify({ name: "x", start_date: "2026-01-01", end_date: "2026-02-01", goal_amount: 100 }),
  });
  await r.text();
  assertEquals(r.status, 401);
});
