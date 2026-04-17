import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

interface BatchRequest {
  entity_type: "client" | "lead" | "deal" | "activity" | "call_recording";
  limit?: number;
}

const TABLE_BY_TYPE: Record<string, string> = {
  client: "clients",
  lead: "sales",
  deal: "sales",
  activity: "activities",
  call_recording: "call_recordings",
};

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

    const { entity_type, limit = 100 } = (await req.json()) as BatchRequest;
    if (!entity_type || !TABLE_BY_TYPE[entity_type]) {
      return new Response(JSON.stringify({ error: "invalid entity_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: rows } = await admin.from(TABLE_BY_TYPE[entity_type])
      .select("id").order("created_at", { ascending: false }).limit(Math.min(limit, 500));

    let queued = 0;
    const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/semantic-index-entity`;
    for (const r of rows ?? []) {
      // fire-and-forget
      fetch(fnUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
        body: JSON.stringify({ entity_type, entity_id: r.id }),
      }).catch(() => {});
      queued++;
    }

    return new Response(JSON.stringify({ ok: true, queued }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-reindex-batch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
