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

interface DLQRow {
  id: string;
  subscription_id: string;
  event: string;
  payload: Record<string, unknown>;
  status: string;
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
    const idsRaw: unknown = body?.dead_letter_ids ?? (body?.dead_letter_id ? [body.dead_letter_id] : []);
    const ids: string[] = Array.isArray(idsRaw)
      ? idsRaw.filter((x): x is string => typeof x === "string" && /^[0-9a-f-]{36}$/i.test(x))
      : [];
    if (!ids.length || ids.length > 50) {
      return new Response(JSON.stringify({ error: "dead_letter_ids must be 1–50 valid uuids" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: rows, error: fetchErr } = await supabase
      .from("winloss_webhook_dead_letters")
      .select("id, subscription_id, event, payload, status")
      .in("id", ids);
    if (fetchErr) throw fetchErr;
    const dlqRows = (rows ?? []) as DLQRow[];

    jlog("info", { msg: "replay_start", requestId, count: dlqRows.length, ids });

    // mark replaying
    await supabase
      .from("winloss_webhook_dead_letters")
      .update({ status: "replaying" })
      .in("id", dlqRows.map((r) => r.id));

    const results: Array<{ id: string; succeeded: boolean; status: number; error: string | null }> = [];

    for (const row of dlqRows) {
      try {
        const { data, error } = await supabase.functions.invoke("winloss-webhook-dispatcher", {
          body: {
            ...row.payload,
            event: row.event,
            __replay_of: row.id,
            __target_subscription_id: row.subscription_id,
          },
        });
        if (error) throw error;
        const r = (data?.results?.[0] ?? {}) as { succeeded?: boolean; status?: number; error?: string | null };
        results.push({ id: row.id, succeeded: !!r.succeeded, status: r.status ?? 0, error: r.error ?? null });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // restore to pending so user can try again
        await supabase
          .from("winloss_webhook_dead_letters")
          .update({ status: "pending", last_replay_at: new Date().toISOString(), last_replay_error: msg })
          .eq("id", row.id);
        results.push({ id: row.id, succeeded: false, status: 0, error: msg });
      }
    }

    jlog("info", { msg: "replay_complete", requestId, results });

    return new Response(JSON.stringify({ requestId, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    jlog("error", { msg: "replay_fatal", requestId, error: e instanceof Error ? e.message : String(e) });
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", requestId }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
