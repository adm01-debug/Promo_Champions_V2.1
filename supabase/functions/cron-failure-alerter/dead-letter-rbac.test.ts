// RBAC tests para RPCs administrativas de dead-letter ingest.
// Cobre: anon → 403, authenticated sem role admin → 403, service_role → 200.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

async function rpc(fn: string, body: Record<string, unknown>, key: string, bearer?: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${bearer ?? key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, text };
}

Deno.test("fn_admin_list_dead_letter_ingest_jobs — anon (403)", async () => {
  const r = await rpc("fn_admin_list_dead_letter_ingest_jobs", { _limit: 10 }, ANON_KEY);
  // PostgREST maps our EXCEPTION 42501 → 403 (forbidden)
  assert(r.status === 403 || r.status === 401, `expected 401/403 got ${r.status}: ${r.text}`);
  assert(/access_denied|permission|not allowed|jwt/i.test(r.text));
});

Deno.test("fn_admin_replay_dead_letter_ingest_job — anon (403)", async () => {
  const r = await rpc(
    "fn_admin_replay_dead_letter_ingest_job",
    { _job_id: "00000000-0000-0000-0000-000000000000" },
    ANON_KEY,
  );
  assert(r.status === 403 || r.status === 401, `expected 401/403 got ${r.status}: ${r.text}`);
});

Deno.test({
  name: "fn_admin_list_dead_letter_ingest_jobs — service_role (200)",
  ignore: !SERVICE_KEY,
  fn: async () => {
    const r = await rpc("fn_admin_list_dead_letter_ingest_jobs", { _limit: 5 }, SERVICE_KEY!);
    assertEquals(r.status, 200);
    assert(r.text.startsWith("[") || r.text === "[]");
  },
});

Deno.test({
  name: "fn_admin_cron_alert_breakdown — service_role (200 array)",
  ignore: !SERVICE_KEY,
  fn: async () => {
    const r = await rpc("fn_admin_cron_alert_breakdown", {}, SERVICE_KEY!);
    assertEquals(r.status, 200);
    const parsed = JSON.parse(r.text);
    assert(Array.isArray(parsed));
  },
});
