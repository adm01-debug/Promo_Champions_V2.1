import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const URL_FN = `${SUPABASE_URL}/functions/v1/race-commentary`;

Deno.test("race-commentary: OPTIONS CORS", async () => {
  const r = await fetch(URL_FN, { method: "OPTIONS" });
  await r.text();
  assertEquals(r.status, 200);
  assertEquals(r.headers.get("Access-Control-Allow-Origin"), "*");
});

Deno.test("race-commentary: invalid leaderboard → 400", async () => {
  const r = await fetch(URL_FN, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ leaderboard: "not-an-array" }),
  });
  const body = await r.json();
  assertEquals(r.status, 400);
  assert(body.error);
});

Deno.test("race-commentary: empty leaderboard accepted (returns 200 or 5xx if AI not configured)", async () => {
  const r = await fetch(URL_FN, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({
      leaderboard: [],
      roleType: "closer",
      seasonName: "Test",
      context: "periodic",
    }),
  });
  await r.text();
  // Aceito 200 (commentary), 429 (rate), 402 (credits), 500 (no LOVABLE_API_KEY)
  assert([200, 402, 429, 500].includes(r.status), `unexpected status ${r.status}`);
});
