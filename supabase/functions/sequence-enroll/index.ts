import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface EnrollPayload {
  sequence_id: string;
  contacts: Array<{ contact_id: string; contact_type: "lead" | "client" | "contact" }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as EnrollPayload;
    if (!payload.sequence_id || !Array.isArray(payload.contacts) || payload.contacts.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify access to sequence (RLS via user client)
    const { data: seq, error: seqErr } = await userClient
      .from("sequences")
      .select("id, enabled")
      .eq("id", payload.sequence_id)
      .maybeSingle();

    if (seqErr || !seq) {
      return new Response(JSON.stringify({ error: "Sequence not found or no access" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get first step delay to set initial next_action_at
    const { data: firstStep } = await admin
      .from("sequence_steps")
      .select("delay_days, delay_hours")
      .eq("sequence_id", payload.sequence_id)
      .order("step_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    const delayMs = firstStep
      ? (firstStep.delay_days * 24 + firstStep.delay_hours) * 3600 * 1000
      : 0;
    const nextActionAt = new Date(Date.now() + delayMs).toISOString();

    const rows = payload.contacts.map((c) => ({
      sequence_id: payload.sequence_id,
      contact_id: c.contact_id,
      contact_type: c.contact_type,
      enrolled_by: userData.user.id,
      status: "active",
      current_step: 0,
      next_action_at: nextActionAt,
    }));

    const { data: inserted, error: insErr } = await admin
      .from("sequence_enrollments")
      .upsert(rows, {
        onConflict: "sequence_id,contact_id,contact_type",
        ignoreDuplicates: true,
      })
      .select("id");

    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({
        ok: true,
        enrolled: inserted?.length ?? 0,
        skipped_duplicates: rows.length - (inserted?.length ?? 0),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
