import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";
import { getServiceClient, getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";

interface BuildPayload {
  queue_id: string;
  max_items?: number;
}

Deno.serve(withRequestId("dialer-queue-builder", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const caller = await getUserClient(req);

    // Rebuild delete+reinsere dialer_queue_items: exige bypass de RLS.
    const supabase = getServiceClient("rebuild de dialer_queue_items (bypass RLS)");

    const body = (await req.json()) as BuildPayload;
    if (!body.queue_id) {
      return new Response(JSON.stringify({ error: "queue_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const maxItems = Math.min(body.max_items ?? 50, 200);

    const { data: queue, error: qErr } = await supabase
      .from("dialer_queues").select("id, filter, owner_id, priority_strategy").eq("id", body.queue_id).single();
    if (qErr || !queue) {
      return new Response(JSON.stringify({ error: "Queue not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Só o dono da fila (ou admin) pode reconstruí-la — espelha a policy de
    // escrita de dialer_queues.
    if (queue.owner_id !== caller.userId) {
      const { data: isAdmin, error: roleErr } = await caller.client.rpc(
        "has_role" as never,
        { _user_id: caller.userId, _role: "admin" } as never,
      );
      if (roleErr) throw roleErr;
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
    const scores = await chunkedIn<{ sale_id: string; score: number }>(
      saleIds,
      (chunk) =>
        supabase
          .from("email_engagement_scores")
          .select("sale_id, score")
          .in("sale_id", chunk),
      { parallel: true, label: "dialer-queue-builder.scores" }
    );

    const scoreMap = new Map<string, number>(
      scores.map((s) => [s.sale_id, Number(s.score) || 0]),
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
    if (err instanceof UnauthorizedError) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error('dialer-queue-builder error:', err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
