import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



function classifyBias(variancePct: number): "optimistic" | "pessimistic" | "accurate" {
  if (Math.abs(variancePct) <= 10) return "accurate";
  return variancePct < 0 ? "optimistic" : "pessimistic";
}

Deno.serve(withRequestId("compute-forecast-accuracy", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data: snapshots, error: snapErr } = await supabase
      .from("forecast_snapshots")
      .select("id, period_start, period_end, owner_id, weighted_amount, forecast_amount")
      .lte("period_end", today)
      .order("period_end", { ascending: false })
      .limit(500);
    if (snapErr) throw snapErr;

    let computed = 0;
    const rows = snapshots ?? [];

    // Pre-fetch ALL completed sales in the full date range covering all snapshots — 1 query total
    let allSales: Array<{ amount: number; salesperson_id: string | null; created_at: string }> = [];
    if (rows.length > 0) {
      const minPeriod = rows.reduce((m, s) => (s.period_start < m ? s.period_start : m), rows[0].period_start);
      const maxPeriod = rows.reduce((m, s) => (s.period_end > m ? s.period_end : m), rows[0].period_end);
      const { data: salesData } = await supabase
        .from("sales")
        .select("amount, salesperson_id, created_at")
        .eq("status", "completed")
        .gte("created_at", minPeriod)
        .lte("created_at", maxPeriod + "T23:59:59")
        .limit(50000);
      allSales = (salesData ?? []) as typeof allSales;
    }

    // Compute accuracy per snapshot in memory — no more per-snapshot DB reads
    const accuracyRows: Array<Record<string, unknown>> = [];
    const computedAt = new Date().toISOString();

    for (const snap of rows) {
      const completed = allSales.filter(
        (s) =>
          s.created_at >= snap.period_start &&
          s.created_at <= snap.period_end + "T23:59:59" &&
          (!snap.owner_id || s.salesperson_id === snap.owner_id)
      );

      const actualAmount = completed.reduce((s, r) => s + Number(r.amount ?? 0), 0);
      const actualDeals = completed.length;
      const forecast = Number(snap.weighted_amount ?? snap.forecast_amount ?? 0);
      const variancePct = forecast > 0 ? ((actualAmount - forecast) / forecast) * 100 : 0;
      const mape = forecast > 0 ? Math.abs((actualAmount - forecast) / forecast) * 100 : 0;
      const bias = classifyBias(variancePct);

      accuracyRows.push({
        snapshot_id: snap.id,
        actual_amount: actualAmount,
        actual_deals: actualDeals,
        variance_pct: Math.round(variancePct * 100) / 100,
        mape: Math.round(mape * 100) / 100,
        bias,
        computed_at: computedAt,
      });
    }

    // Single batch upsert for all accuracy rows
    if (accuracyRows.length > 0) {
      const { error: upErr } = await supabase
        .from("forecast_accuracy")
        .upsert(accuracyRows, { onConflict: "snapshot_id" });
      if (!upErr) computed = accuracyRows.length;
    }

    // Aggregate confidence scores per (owner_id, source)
    const { data: joined } = await supabase
      .from("forecast_snapshots")
      .select("owner_id, source, forecast_accuracy(mape, bias)")
      .limit(1000);

    const agg = new Map<
      string,
      { owner_id: string | null; source: string; mapes: number[]; biases: string[] }
    >();
    for (const row of (joined as Array<{
      owner_id: string | null;
      source: string;
      forecast_accuracy: Array<{ mape: number; bias: string }> | null;
    }>) ?? []) {
      if (!row.forecast_accuracy || row.forecast_accuracy.length === 0) continue;
      const key = `${row.owner_id ?? "all"}__${row.source}`;
      const a = agg.get(key) ?? {
        owner_id: row.owner_id,
        source: row.source,
        mapes: [],
        biases: [],
      };
      for (const fa of row.forecast_accuracy) {
        a.mapes.push(Number(fa.mape));
        a.biases.push(fa.bias);
      }
      agg.set(key, a);
    }

    // Batch upsert confidence scores — was 1 upsert per aggregation bucket
    const confidenceRows: Array<Record<string, unknown>> = [];
    const confidenceAt = new Date().toISOString();
    for (const a of agg.values()) {
      const avgMape =
        a.mapes.reduce((s, v) => s + v, 0) / Math.max(a.mapes.length, 1);
      const optCount = a.biases.filter((b) => b === "optimistic").length;
      const pesCount = a.biases.filter((b) => b === "pessimistic").length;
      const biasTrend =
        optCount > pesCount && optCount > a.biases.length / 3
          ? "optimistic"
          : pesCount > optCount && pesCount > a.biases.length / 3
            ? "pessimistic"
            : "accurate";
      const confidence = Math.max(0, Math.min(100, 100 - avgMape));
      confidenceRows.push({
        owner_id: a.owner_id,
        source: a.source,
        period_count: a.mapes.length,
        avg_mape: Math.round(avgMape * 100) / 100,
        bias_trend: biasTrend,
        confidence_score: Math.round(confidence * 100) / 100,
        computed_at: confidenceAt,
      });
    }
    if (confidenceRows.length > 0) {
      await supabase.from("forecast_confidence_scores").upsert(confidenceRows, { onConflict: "owner_id,source" });
    }

    return new Response(JSON.stringify({ computed, scored: agg.size }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error('compute-forecast-accuracy error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }
}));
