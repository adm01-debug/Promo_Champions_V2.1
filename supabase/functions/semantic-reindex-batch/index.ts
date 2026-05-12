import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

type EntityType =
  | "client" | "lead" | "deal" | "activity" | "call_recording"
  | "note" | "email_message" | "whatsapp_message" | "proposal" | "task" | "playbook" | "product";

interface BatchRequest {
  entity_types?: EntityType[];
  only_missing?: boolean;
  batch_size?: number;
  concurrency?: number;
}

const TABLE_BY_TYPE: Record<EntityType, { table: string; statusFilter?: string[] }> = {
  client: { table: "clients" },
  lead: { table: "sales", statusFilter: ["lead", "prospecting", "qualified"] },
  deal: { table: "sales", statusFilter: ["proposal", "negotiation", "won", "lost", "closed"] },
  activity: { table: "activities" },
  call_recording: { table: "call_recordings" },
  note: { table: "notes" },
  email_message: { table: "email_messages" },
  whatsapp_message: { table: "whatsapp_messages" },
  proposal: { table: "proposals" },
  task: { table: "tasks" },
  playbook: { table: "playbooks" },
};

const DEFAULT_TYPES: EntityType[] = ["client", "lead", "deal", "activity", "call_recording"];

async function pMap<T, R>(items: T[], concurrency: number, fn: (it: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (i < items.length) {
      const idx = i++;
      try { results[idx] = await fn(items[idx]); } catch { /* ignore individual failure */ }
    }
  });
  await Promise.all(workers);
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await userClient.rpc("is_admin_or_manager", { _user_id: u.user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "admin/manager only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as BatchRequest;
    const types = (body.entity_types && body.entity_types.length > 0 ? body.entity_types : DEFAULT_TYPES)
      .filter((t) => TABLE_BY_TYPE[t]);
    const onlyMissing = body.only_missing !== false; // default true
    const batchSize = Math.min(Math.max(1, body.batch_size ?? 100), 500);
    const concurrency = Math.min(Math.max(1, body.concurrency ?? 4), 8);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/semantic-index-entity`;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const summary: Record<string, { queued: number; skipped: number; failed: number; total_candidates: number }> = {};

    for (const t of types) {
      const cfg = TABLE_BY_TYPE[t];
      let q = admin.from(cfg.table).select("id").order("created_at", { ascending: false }).limit(batchSize);
      if (cfg.statusFilter) q = q.in("status", cfg.statusFilter);

      const { data: rows, error: rowsErr } = await q;
      if (rowsErr) {
        // table might not exist (e.g., tasks/proposals not yet in this project) — skip gracefully
        summary[t] = { queued: 0, skipped: 0, failed: 0, total_candidates: 0 };
        continue;
      }
      const candidateIds = (rows ?? []).map((r) => r.id as string);

      let targetIds = candidateIds;
      if (onlyMissing && candidateIds.length > 0) {
        const { data: existing } = await admin
          .from("semantic_index")
          .select("entity_id")
          .eq("entity_type", t)
          .in("entity_id", candidateIds);
        const indexedSet = new Set((existing ?? []).map((r) => r.entity_id as string));
        targetIds = candidateIds.filter((id) => !indexedSet.has(id));
      }

      const results = await pMap(targetIds, concurrency, async (id) => {
        const r = await fetch(fnUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify({ entity_type: t, entity_id: id }),
        });
        return r.ok;
      });

      const queued = results.filter(Boolean).length;
      summary[t] = {
        queued,
        skipped: candidateIds.length - targetIds.length,
        failed: targetIds.length - queued,
        total_candidates: candidateIds.length,
      };
    }

    return new Response(JSON.stringify({ ok: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-reindex-batch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
