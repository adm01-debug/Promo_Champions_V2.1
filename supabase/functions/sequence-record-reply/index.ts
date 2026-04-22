import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claims?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const enrollmentId = body?.enrollment_id as string | undefined;
    const occurredAt = (body?.occurred_at as string | undefined) ?? new Date().toISOString();
    if (!enrollmentId) {
      return new Response(JSON.stringify({ error: "enrollment_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: exec } = await admin
      .from("sequence_step_executions")
      .select("id, variant_id, enrollment_id")
      .eq("enrollment_id", enrollmentId)
      .is("replied_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (exec?.id) {
      await admin
        .from("sequence_step_executions")
        .update({ replied_at: occurredAt })
        .eq("id", exec.id);
    }

    const { data: enr } = await admin
      .from("sequence_enrollments")
      .select("contact_id, contact_type")
      .eq("id", enrollmentId)
      .maybeSingle();

    if (enr?.contact_id && enr?.contact_type) {
      await admin.rpc("record_engagement_signal", {
        _contact_id: enr.contact_id,
        _contact_type: enr.contact_type,
        _signal: "reply",
        _occurred_at: occurredAt,
      });
      // Recompute engagement score inline (trigger also fires, this ensures sync return)
      await admin.rpc("recompute_engagement_score", {
        _contact_id: enr.contact_id,
        _contact_type: enr.contact_type,
      });
    }

    await admin
      .from("sequence_enrollments")
      .update({ status: "paused", next_action_at: null })
      .eq("id", enrollmentId);

    return new Response(
      JSON.stringify({ ok: true, execution_id: exec?.id ?? null, variant_id: exec?.variant_id ?? null }),
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
