import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";

Deno.serve(withRequestId("semantic-coverage", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let authHeader: string;
    try {
      const ctx = await getUserClient(req);
      authHeader = ctx.authHeader;
    } catch (authErr) {
      const msg = authErr instanceof UnauthorizedError ? (authErr as UnauthorizedError).message : "Unauthorized";
      return new Response(JSON.stringify({ error: msg }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data, error } = await supabase.rpc("get_semantic_coverage");
    if (error) {
      const status = /forbidden/i.test(error.message) ? 403 : 500;
      return new Response(JSON.stringify({ error: error.message }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, coverage: data ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-coverage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
