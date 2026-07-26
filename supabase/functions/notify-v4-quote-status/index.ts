import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { ...getCorsHeaders(req), getCorsHeaders } from "../_shared/cors.ts";
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
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

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
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  if (!isValidUrl(callbackUrl)) {
    log("error", "v4_callback_misconfigured", { reason: "invalid_url" });
    return new Response(
      JSON.stringify({ success: false, error: "invalid V4_CALLBACK_URL" }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
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
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }

  const results: Array<Record<string, unknown>> = [];

  // Phase 1: fire HTTP callbacks sequentially (webhook ordering matters per receiver)
  type ItemOutcome = {
    id: string;
    ok: boolean;
    statusCode: number;
    responseText: string;
    attempts: number;
    latency: number;
    exhausted: boolean;
    nextRetry: string;
    item: typeof (items ?? [])[number];
  };
  const outcomes: ItemOutcome[] = [];

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
    const exhausted = !ok && attempts >= MAX_ATTEMPTS;
    const nextRetry = new Date(Date.now() + backoffMs(attempts)).toISOString();
    outcomes.push({ id: item.id, ok, statusCode, responseText, attempts, latency, exhausted, nextRetry, item });
  }

  // Phase 2: batch all dead_letter updates in parallel — zero serial DB calls inside loop
  const resolvedAt = new Date().toISOString();
  await Promise.all(
    outcomes.map(({ id, ok, statusCode, responseText, attempts, exhausted, nextRetry }) =>
      ok
        ? supabase.from("v4_callback_dead_letters").update({ resolved_at: resolvedAt, attempts, last_error: null }).eq("id", id)
        : supabase.from("v4_callback_dead_letters").update({
            attempts,
            last_error: `[${statusCode}] ${responseText.slice(0, 500)}`,
            next_retry_at: exhausted ? null : nextRetry,
          }).eq("id", id)
    )
  );

  // Phase 3: accumulate metric counters — 3 RPC calls max regardless of batch size
  const sentOk = outcomes.filter((o) => o.ok).length;
  const failed = outcomes.filter((o) => !o.ok).length;
  const exhaustedCount = outcomes.filter((o) => o.exhausted).length;

  await Promise.all([
    sentOk > 0 ? supabase.rpc("increment_v4_callback_metric", { _column: "sent_ok", _delta: sentOk }) : Promise.resolve(),
    failed > 0 ? supabase.rpc("increment_v4_callback_metric", { _column: "failed", _delta: failed }) : Promise.resolve(),
    exhaustedCount > 0 ? supabase.rpc("increment_v4_callback_metric", { _column: "exhausted", _delta: exhaustedCount }) : Promise.resolve(),
  ]);

  // Phase 4: structured logs + result array
  for (const o of outcomes) {
    if (o.ok) {
      log("info", "v4_callback_sent", { id: o.id, external_quote_id: o.item.external_quote_id, event: o.item.event_type, status: o.statusCode, latency_ms: o.latency });
      results.push({ id: o.id, ok: true, status: o.statusCode });
    } else {
      if (o.exhausted) {
        log("error", "v4_callback_exhausted", { id: o.id, external_quote_id: o.item.external_quote_id, event: o.item.event_type, attempts: o.attempts, status: o.statusCode, last_error: o.responseText.slice(0, 300) });
      } else {
        log("warn", "v4_callback_failed", { id: o.id, attempts: o.attempts, status: o.statusCode, next_retry_at: o.nextRetry, latency_ms: o.latency });
      }
      results.push({ id: o.id, ok: false, status: o.statusCode, attempts: o.attempts, exhausted: o.exhausted });
    }
  }

  return new Response(
    JSON.stringify({ success: true, processed: results.length, results }),
    { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
  );
}));
