import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface BuildPayload {
  queue_id: string;
  max_items?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: claims, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as BuildPayload;
    if (!body.queue_id) {
      return new Response(JSON.stringify({ error: "queue_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const maxItems = Math.min(body.max_items ?? 50, 200);

    const { data: queue, error: qErr } = await supabase
      .from("dialer_queues").select("*").eq("id", body.queue_id).single();
    if (qErr || !queue) {
      return new Response(JSON.stringify({ error: "Queue not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const filter = (queue.filter ?? {}) as Record<string, unknown>;
    const minScore = typeof filter.min_score === "number" ? filter.min_score : 0;
    const ownerScope = typeof filter.owner_id === "string" ? filter.owner_id : queue.owner_id;

    // Pull candidate sales owned by the queue owner (or filter's owner)
    const { data: sales, error: sErr } = await supabase
      .from("sales")
      .select("id, salesperson_id, client_name, status, updated_at")
      .eq("salesperson_id", ownerScope)
      .neq("status", "Vendido")
      .neq("status", "Perdido")
      .limit(500);
    if (sErr) throw sErr;

    if (!sales || sales.length === 0) {
      await supabase.from("dialer_queues").update({ last_built_at: new Date().toISOString() }).eq("id", queue.id);
      return new Response(JSON.stringify({ ok: true, items_built: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const saleIds = sales.map((s) => s.id);
    const { data: scores } = await supabase
      .from("email_engagement_scores")
      .select("sale_id, score")
      .in("sale_id", saleIds);

    const scoreMap = new Map<string, number>(
      (scores ?? []).map((s) => [s.sale_id as string, Number(s.score) || 0]),
    );

    const now = Date.now();
    const strategy = queue.priority_strategy as string;

    type Scored = { sale_id: string; score: number };
    const scored: Scored[] = sales
      .map((s) => {
        const emailScore = scoreMap.get(s.id) ?? 0;
        const lastTouch = s.updated_at ? new Date(s.updated_at).getTime() : 0;
        const daysSince = lastTouch ? (now - lastTouch) / (86400 * 1000) : 90;
        const recencyScore = Math.max(0, Math.min(100, daysSince * 1.5));
        let priority = 0;
        if (strategy === "score") priority = emailScore;
        else if (strategy === "recency") priority = recencyScore;
        else if (strategy === "send_time") priority = emailScore * 0.5 + 25;
        else priority = emailScore * 0.5 + recencyScore * 0.2 + 30 * 0.3;
        return { sale_id: s.id, score: Number(priority.toFixed(2)) };
      })
      .filter((s) => s.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems);

    // Reset previous pending/snoozed items
    await supabase.from("dialer_queue_items").delete()
      .eq("queue_id", queue.id).in("status", ["pending", "snoozed"]);

    const rows = scored.map((s, idx) => ({
      queue_id: queue.id,
      sale_id: s.sale_id,
      score: s.score,
      queue_position: idx + 1,
      status: "pending",
    }));

    if (rows.length > 0) {
      const { error: insErr } = await supabase
        .from("dialer_queue_items")
        .upsert(rows, { onConflict: "queue_id,sale_id" });
      if (insErr) throw insErr;
    }

    await supabase.from("dialer_queues")
      .update({ last_built_at: new Date().toISOString() }).eq("id", queue.id);

    return new Response(JSON.stringify({ ok: true, items_built: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
