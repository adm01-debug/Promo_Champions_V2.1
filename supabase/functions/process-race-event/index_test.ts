import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const URL_FN = `${SUPABASE_URL}/functions/v1/process-race-event`;

Deno.test("process-race-event: OPTIONS returns CORS", async () => {
  const r = await fetch(URL_FN, { method: "OPTIONS" });
  await r.text();
  assertEquals(r.status, 200);
  assertEquals(r.headers.get("Access-Control-Allow-Origin"), "*");
});

Deno.test("process-race-event: missing auth returns 401", async () => {
  const r = await fetch(URL_FN, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({}),
  });
  const body = await r.json();
  assertEquals(r.status, 401);
  assertEquals(body.error, "Unauthorized");
});

Deno.test("process-race-event: invalid bearer returns 401", async () => {
  const r = await fetch(URL_FN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: "Bearer invalid.token.here",
    },
    body: JSON.stringify({}),
  });
  await r.text();
  assertEquals(r.status, 401);
});
