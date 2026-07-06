import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const callbackUrl = Deno.env.get("V4_CALLBACK_URL") ?? "";
const callbackApiKey = Deno.env.get("V4_CALLBACK_API_KEY") ?? "";

const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 30_000; // 30s * 2^attempt
const HTTP_TIMEOUT_MS = 8000;
const BATCH_SIZE = 20;

function backoffMs(attempts: number): number {
  const base = BASE_BACKOFF_MS * Math.pow(2, Math.min(attempts, 6));
  const jitter = Math.floor(Math.random() * 5000);
  return base + jitter;
}

async function postWithTimeout(url: string, payload: unknown, apiKey: string): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Se V4 não está configurado, marcamos os items para não retentar em loop
  if (!callbackUrl || !callbackApiKey) {
    console.info("[notify-v4-quote-status] V4_CALLBACK_URL/V4_CALLBACK_API_KEY não configurados — nada a fazer");
    return new Response(
      JSON.stringify({ success: true, processed: 0, note: "callback disabled (missing config)" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const now = new Date().toISOString();

  const { data: items, error } = await supabase
    .from("v4_callback_dead_letters")
    .select("id, external_quote_id, event_type, payload, attempts")
    .is("resolved_at", null)
    .or(`next_retry_at.is.null,next_retry_at.lte.${now}`)
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error("[notify-v4-quote-status] fetch failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<Record<string, unknown>> = [];

  for (const item of items ?? []) {
    let ok = false;
    let statusCode = 0;
    let responseText = "";
    try {
      const resp = await postWithTimeout(callbackUrl, item.payload, callbackApiKey);
      statusCode = resp.status;
      responseText = await resp.text();
      ok = resp.ok;
    } catch (e) {
      responseText = e instanceof Error ? e.message : String(e);
    }

    const attempts = (item.attempts ?? 0) + 1;
    if (ok) {
      await supabase
        .from("v4_callback_dead_letters")
        .update({
          resolved_at: new Date().toISOString(),
          attempts,
          last_error: null,
        })
        .eq("id", item.id);
      results.push({ id: item.id, ok: true, status: statusCode });
    } else {
      const nextRetry = new Date(Date.now() + backoffMs(attempts)).toISOString();
      await supabase
        .from("v4_callback_dead_letters")
        .update({
          attempts,
          last_error: `[${statusCode}] ${responseText.slice(0, 500)}`,
          next_retry_at: attempts >= MAX_ATTEMPTS ? null : nextRetry,
        })
        .eq("id", item.id);
      results.push({ id: item.id, ok: false, status: statusCode, attempts });
    }
  }

  return new Response(
    JSON.stringify({ success: true, processed: results.length, results }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
