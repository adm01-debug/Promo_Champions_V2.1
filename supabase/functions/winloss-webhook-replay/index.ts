import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jlog(level: "info" | "warn" | "error", data: Record<string, unknown>) {
  const line = JSON.stringify({ fn: "winloss-webhook-replay", level, ts: new Date().toISOString(), ...data });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SourceRow {
  id: string;
  subscription_id: string;
  event: string;
  payload: Record<string, unknown>;
  // for DLQ rows only
  dlq?: boolean;
  // for delivery rows only
  succeeded?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const requestId = crypto.randomUUID();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsErr } = await supabaseAuth.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub as string;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // role check
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      jlog("warn", { msg: "forbidden", requestId, userId });
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const dlqRaw: unknown = body?.dead_letter_ids ?? (body?.dead_letter_id ? [body.dead_letter_id] : null);
    const delRaw: unknown = body?.delivery_ids ?? (body?.delivery_id ? [body.delivery_id] : null);

    if ((dlqRaw && delRaw) || (!dlqRaw && !delRaw)) {
      return new Response(JSON.stringify({ error: "Provide exactly one of dead_letter_ids or delivery_ids" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const source: "dlq" | "delivery" = dlqRaw ? "dlq" : "delivery";
    const rawList = (dlqRaw ?? delRaw) as unknown;
    const ids: string[] = Array.isArray(rawList)
      ? rawList.filter((x): x is string => typeof x === "string" && UUID_RE.test(x))
      : [];
    if (!ids.length || ids.length > 50) {
      return new Response(JSON.stringify({ error: `${source === "dlq" ? "dead_letter_ids" : "delivery_ids"} must be 1–50 valid uuids` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let rows: SourceRow[] = [];
    if (source === "dlq") {
      const { data, error } = await supabase
        .from("winloss_webhook_dead_letters")
        .select("id, subscription_id, event, payload, status")
        .in("id", ids);
      if (error) throw error;
      rows = (data ?? []).map((r) => ({
        id: r.id as string,
        subscription_id: r.subscription_id as string,
        event: r.event as string,
        payload: (r.payload ?? {}) as Record<string, unknown>,
        dlq: true,
      }));

      // mark replaying
      await supabase
        .from("winloss_webhook_dead_letters")
        .update({ status: "replaying" })
        .in("id", rows.map((r) => r.id));
    } else {
      const { data, error } = await supabase
        .from("winloss_webhook_deliveries")
        .select("id, subscription_id, event, payload, succeeded")
        .in("id", ids);
      if (error) throw error;
      rows = (data ?? []).map((r) => ({
        id: r.id as string,
        subscription_id: r.subscription_id as string,
        event: r.event as string,
        payload: (r.payload ?? {}) as Record<string, unknown>,
        succeeded: r.succeeded as boolean,
      }));
    }

    jlog("info", { msg: "replay_start", requestId, source, count: rows.length, ids });

    const results: Array<{ id: string; succeeded: boolean; status: number; error: string | null; skipped?: boolean }> = [];

    for (const row of rows) {
      // Skip already-succeeded deliveries
      if (source === "delivery" && row.succeeded) {
        results.push({ id: row.id, succeeded: false, status: 0, error: "already_succeeded", skipped: true });
        continue;
      }

      try {
        const dispatchBody: Record<string, unknown> = {
          ...row.payload,
          event: row.event,
          __target_subscription_id: row.subscription_id,
        };
        if (source === "dlq") dispatchBody.__replay_of = row.id;

        const { data, error } = await supabase.functions.invoke("winloss-webhook-dispatcher", {
          body: dispatchBody,
        });
        if (error) throw error;
        const r = (data?.results?.[0] ?? {}) as { succeeded?: boolean; status?: number; error?: string | null };
        results.push({ id: row.id, succeeded: !!r.succeeded, status: r.status ?? 0, error: r.error ?? null });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (source === "dlq") {
          // restore so user can try again
          await supabase
            .from("winloss_webhook_dead_letters")
            .update({ status: "pending", last_replay_at: new Date().toISOString(), last_replay_error: msg })
            .eq("id", row.id);
        }
        results.push({ id: row.id, succeeded: false, status: 0, error: msg });
      }
    }

    jlog("info", { msg: "replay_complete", requestId, source, results });

    return new Response(JSON.stringify({ requestId, source, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    jlog("error", { msg: "replay_fatal", requestId, error: e instanceof Error ? e.message : String(e) });
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", requestId }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
