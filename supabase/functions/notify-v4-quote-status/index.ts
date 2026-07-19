import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const callbackUrl = Deno.env.get("V4_CALLBACK_URL") ?? "";
const callbackApiKey = Deno.env.get("V4_CALLBACK_API_KEY") ?? "";
if (!callbackUrl) throw new Error("V4_CALLBACK_URL is not configured");
if (!callbackApiKey) throw new Error("V4_CALLBACK_API_KEY is not configured");

const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 30_000;
const HTTP_TIMEOUT_MS = 8000;
const BATCH_SIZE = 20;

function log(level: "info" | "warn" | "error", event: string, data: Record<string, unknown> = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...data });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function backoffMs(attempts: number): number {
  const base = BASE_BACKOFF_MS * Math.pow(2, Math.min(attempts, 6));
  const jitter = Math.floor(Math.random() * 5000);
  return base + jitter;
}

function isValidUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

async function postWithTimeout(url: string, payload: unknown, apiKey: string): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(withRequestId("notify-v4-quote-status", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Guarda de configuração: sem secrets, apenas conta o backlog e retorna
  if (!callbackUrl || !callbackApiKey) {
    const { count } = await supabase
      .from("v4_callback_dead_letters")
      .select("id", { count: "exact", head: true })
      .is("resolved_at", null);
    log("warn", "v4_callback_disabled", { pending: count ?? 0, reason: "missing_secrets" });
    return new Response(
      JSON.stringify({ success: true, processed: 0, pending: count ?? 0, note: "callback disabled (missing config)" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!isValidUrl(callbackUrl)) {
    log("error", "v4_callback_misconfigured", { reason: "invalid_url" });
    return new Response(
      JSON.stringify({ success: false, error: "invalid V4_CALLBACK_URL" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
    log("error", "v4_callback_fetch_failed", { message: error.message });
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
    const t0 = Date.now();
    try {
      const resp = await postWithTimeout(callbackUrl, item.payload, callbackApiKey);
      statusCode = resp.status;
      responseText = await resp.text();
      ok = resp.ok;
    } catch (e) {
      responseText = e instanceof Error ? e.message : String(e);
    }
    const latency = Date.now() - t0;

    const attempts = (item.attempts ?? 0) + 1;
    if (ok) {
      await supabase.from("v4_callback_dead_letters").update({
        resolved_at: new Date().toISOString(),
        attempts,
        last_error: null,
      }).eq("id", item.id);
      await supabase.rpc("increment_v4_callback_metric", { _column: "sent_ok", _delta: 1 });
      log("info", "v4_callback_sent", { id: item.id, external_quote_id: item.external_quote_id, event: item.event_type, status: statusCode, latency_ms: latency });
      results.push({ id: item.id, ok: true, status: statusCode });
    } else {
      const exhausted = attempts >= MAX_ATTEMPTS;
      const nextRetry = new Date(Date.now() + backoffMs(attempts)).toISOString();
      await supabase.from("v4_callback_dead_letters").update({
        attempts,
        last_error: `[${statusCode}] ${responseText.slice(0, 500)}`,
        next_retry_at: exhausted ? null : nextRetry,
      }).eq("id", item.id);
      await supabase.rpc("increment_v4_callback_metric", { _column: "failed", _delta: 1 });
      if (exhausted) {
        await supabase.rpc("increment_v4_callback_metric", { _column: "exhausted", _delta: 1 });
        log("error", "v4_callback_exhausted", {
          id: item.id,
          external_quote_id: item.external_quote_id,
          event: item.event_type,
          attempts,
          status: statusCode,
          last_error: responseText.slice(0, 300),
        });
      } else {
        log("warn", "v4_callback_failed", { id: item.id, attempts, status: statusCode, next_retry_at: nextRetry, latency_ms: latency });
      }
      results.push({ id: item.id, ok: false, status: statusCode, attempts, exhausted });
    }
  }

  return new Response(
    JSON.stringify({ success: true, processed: results.length, results }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}));
