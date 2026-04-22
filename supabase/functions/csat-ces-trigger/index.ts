import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

interface TriggerRequest {
  account_id: string;
  contact_email: string;
  survey_type: "csat" | "ces";
  trigger_event?: string;
  score?: number;
  comment?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const body = (await req.json().catch(() => ({}))) as TriggerRequest;

    if (!body.account_id || !body.contact_email || !body.survey_type) {
      return new Response(
        JSON.stringify({ error: "account_id, contact_email e survey_type são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!["csat", "ces"].includes(body.survey_type)) {
      return new Response(
        JSON.stringify({ error: "survey_type deve ser csat ou ces" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Evitar duplicidade — não disparar duas vezes o mesmo trigger_event para a mesma conta nas últimas 24h
    if (body.trigger_event) {
      const { data: dup } = await supabase
        .from("csat_ces_surveys")
        .select("id")
        .eq("account_id", body.account_id)
        .eq("contact_email", body.contact_email)
        .eq("survey_type", body.survey_type)
        .eq("trigger_event", body.trigger_event)
        .gte("sent_at", new Date(Date.now() - 24 * 3600_000).toISOString())
        .limit(1);
      if (dup && dup.length > 0) {
        return new Response(
          JSON.stringify({ ok: true, skipped: true, reason: "Already sent in the last 24h" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { data, error } = await supabase
      .from("csat_ces_surveys")
      .insert({
        account_id: body.account_id,
        contact_email: body.contact_email,
        survey_type: body.survey_type,
        trigger_event: body.trigger_event ?? "manual",
        score: body.score ?? null,
        comment: body.comment ?? null,
        sent_at: new Date().toISOString(),
        responded_at: body.score !== undefined ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, survey: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
