import { ...getCorsHeaders(req), getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";
import { errorEnvelope, jsonResponse } from "../_shared/http-envelope.ts";

interface TriggerRequest {
  account_id: string;
  contact_email: string;
  survey_type: "csat" | "ces";
  trigger_event?: string;
  score?: number;
  comment?: string;
}

Deno.serve(withRequestId("csat-ces-trigger", async (req, ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const body = (await req.json().catch(() => ({}))) as TriggerRequest;

  if (!body.account_id || !body.contact_email || !body.survey_type) {
    ctx.log("warn", "validation_failed", { reason: "missing_required_fields" });
    return errorEnvelope("BAD_REQUEST", "account_id, contact_email e survey_type são obrigatórios", {
      requestId: ctx.requestId,
    });
  }
  if (!["csat", "ces"].includes(body.survey_type)) {
    return errorEnvelope("BAD_REQUEST", "survey_type deve ser csat ou ces", {
      requestId: ctx.requestId,
    });
  }

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
      ctx.log("info", "duplicate_skipped", { account_id: body.account_id });
      return jsonResponse({ skipped: true, reason: "Already sent in the last 24h" }, {
        requestId: ctx.requestId,
      });
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

  if (error) {
    ctx.log("error", "insert_failed", { error: error.message });
    return errorEnvelope("INTERNAL_ERROR", error.message, { requestId: ctx.requestId });
  }

  ctx.log("info", "survey_created", { survey_id: data?.id });
  return jsonResponse({ survey: data }, { requestId: ctx.requestId });
}));
