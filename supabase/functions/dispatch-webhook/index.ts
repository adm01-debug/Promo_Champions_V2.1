import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface DispatchRequest {
  webhook_id?: string;
  event_type: string;
  payload: Record<string, unknown>;
}

async function hmacSign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { event_type, payload, webhook_id }: DispatchRequest = body;

    if (!event_type || !payload) {
      return new Response(JSON.stringify({ error: "event_type and payload are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find matching webhooks
    let q = supabase.from("webhooks").select("*").eq("is_active", true);
    if (webhook_id) q = q.eq("id", webhook_id);
    else q = q.contains("events", [event_type]);

    const { data: webhooks, error } = await q;
    if (error) throw error;

    const results = [];
    for (const wh of webhooks ?? []) {
      const start = Date.now();
      const body = JSON.stringify({ event: event_type, data: payload, timestamp: new Date().toISOString() });
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Webhook-Event": event_type,
        ...((wh.headers as Record<string, string>) || {}),
      };
      if (wh.secret) headers["X-Webhook-Signature"] = await hmacSign(wh.secret, body);

      let status = 0, respBody = "", errMsg: string | null = null, success = false;
      try {
        const r = await fetch(wh.url, { method: "POST", headers, body, signal: AbortSignal.timeout(10000) });
        status = r.status;
        respBody = (await r.text()).slice(0, 1000);
        success = r.ok;
      } catch (e) {
        errMsg = e instanceof Error ? e.message : String(e);
      }

      const duration = Date.now() - start;

      await supabase.from("webhook_deliveries").insert({
        webhook_id: wh.id, event_type, payload, response_status: status,
        response_body: respBody, error_message: errMsg, success, duration_ms: duration,
      });

      await supabase.from("webhooks").update({
        last_triggered_at: new Date().toISOString(),
        ...(success
          ? { last_success_at: new Date().toISOString(), failure_count: 0 }
          : { last_failure_at: new Date().toISOString(), failure_count: (wh.failure_count ?? 0) + 1 }),
      }).eq("id", wh.id);

      results.push({ webhook_id: wh.id, success, status, duration });
    }

    return new Response(JSON.stringify({ dispatched: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
