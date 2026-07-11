// Edge Function: admin-conversion-trail
// Endpoint admin-only que retorna a trilha completa de eventos e efeitos
// colaterais da conversão para um quote_id OU sale_id.
//
// GET /admin-conversion-trail?quote_id=... | ?sale_id=...
// Header: Authorization: Bearer <jwt admin>
// Retorna JSONB agregando quote, sale, orders, order_items, quote_items,
// conversion_audit, sale_notifications_audit, follow_up_notifications e
// follow_up_audit_logs. Propaga X-Request-Id.

import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-request-id",
};

function json(status: number, body: unknown, requestId: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
    },
  });
}

function log(level: "info" | "warn" | "error", requestId: string, msg: string, extra: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ level, request_id: requestId, msg, ...extra }));
}

Deno.serve(async (req) => {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders, "X-Request-Id": requestId } });
  }
  if (req.method !== "GET") {
    return json(405, { error: "method_not_allowed" }, requestId);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json(401, { error: "unauthorized" }, requestId);
  }

  const url = new URL(req.url);
  const quoteId = url.searchParams.get("quote_id");
  const saleId = url.searchParams.get("sale_id");
  if (!quoteId && !saleId) {
    return json(400, { error: "invalid_input", detail: "informe quote_id ou sale_id" }, requestId);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const t0 = Date.now();
  const { data, error } = await client.rpc("fn_admin_conversion_trail" as never, {
    _quote_id: quoteId,
    _sale_id: saleId,
  } as never);
  const latency = Date.now() - t0;

  if (error) {
    log("error", requestId, "trail_rpc_failed", { error: error.message, latency });
    const isForbidden = /FORBIDDEN|NOT_AUTHENTICATED/.test(error.message);
    return json(isForbidden ? 403 : 500, { error: error.message, request_id: requestId }, requestId);
  }

  log("info", requestId, "trail_ok", { latency });
  return json(200, { request_id: requestId, latency_ms: latency, trail: data }, requestId);
});
