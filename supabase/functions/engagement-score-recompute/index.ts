import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let ownerId: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        ownerId = (body?.ownerId as string | undefined) ?? null;
      } catch {
        ownerId = null;
      }
    }

    const { data, error } = await admin.rpc("bulk_recompute_engagement", {
      _owner_id: ownerId,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, updated: data ?? 0, ownerId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
