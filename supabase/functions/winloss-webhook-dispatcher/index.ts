import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Subscription { id: string; url: string; events: string[]; secret: string | null }

async function dispatchOne(sub: Subscription, payload: Record<string, unknown>, supabase: ReturnType<typeof createClient>) {
  const body = JSON.stringify({ ...payload, dispatched_at: new Date().toISOString() });
  let status = 0;
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      const res = await fetch(sub.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Winloss-Event": String(payload.event ?? "unknown"),
          ...(sub.secret ? { "X-Winloss-Signature": sub.secret } : {}),
        },
        body,
      });
      status = res.status;
      if (status >= 200 && status < 300) break;
    } catch (e) {
      console.error("webhook attempt failed", sub.url, e);
    }
    if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 500 * attempts));
  }

  await supabase.from("winloss_webhook_subscriptions")
    .update({ last_dispatch_at: new Date().toISOString(), last_status: status })
    .eq("id", sub.id);
  return { id: sub.id, status, attempts };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const event = String(payload.event ?? "");
    if (!event) {
      return new Response(JSON.stringify({ error: "event required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: subs } = await supabase
      .from("winloss_webhook_subscriptions")
      .select("id, url, events, secret")
      .eq("active", true);
    const targets = ((subs as Subscription[] | null) ?? []).filter(s => s.events.includes(event));

    const results = await Promise.all(targets.map(s => dispatchOne(s, payload, supabase)));
    return new Response(JSON.stringify({ dispatched: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("winloss-webhook-dispatcher error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
