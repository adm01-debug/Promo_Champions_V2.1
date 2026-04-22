import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function classifyBias(variancePct: number): "optimistic" | "pessimistic" | "accurate" {
  if (Math.abs(variancePct) <= 10) return "accurate";
  return variancePct < 0 ? "optimistic" : "pessimistic";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data: snapshots, error: snapErr } = await supabase
      .from("forecast_snapshots")
      .select("*")
      .lte("period_end", today)
      .order("period_end", { ascending: false })
      .limit(500);
    if (snapErr) throw snapErr;

    let computed = 0;

    for (const snap of snapshots ?? []) {
      const q = supabase
        .from("sales")
        .select("amount, salesperson_id, status, created_at")
        .eq("status", "completed")
        .gte("created_at", snap.period_start)
        .lte("created_at", snap.period_end + "T23:59:59");
      if (snap.owner_id) q.eq("salesperson_id", snap.owner_id);
      const { data: completed, error: cErr } = await q;
      if (cErr) continue;

      const actualAmount = (completed ?? []).reduce(
        (s, r) => s + Number(r.amount ?? 0),
        0,
      );
      const actualDeals = completed?.length ?? 0;
      const forecast = Number(snap.weighted_amount ?? snap.forecast_amount ?? 0);
      const variancePct = forecast > 0 ? ((actualAmount - forecast) / forecast) * 100 : 0;
      const mape = forecast > 0 ? Math.abs((actualAmount - forecast) / forecast) * 100 : 0;
      const bias = classifyBias(variancePct);

      const { error: upErr } = await supabase
        .from("forecast_accuracy")
        .upsert(
          {
            snapshot_id: snap.id,
            actual_amount: actualAmount,
            actual_deals: actualDeals,
            variance_pct: Math.round(variancePct * 100) / 100,
            mape: Math.round(mape * 100) / 100,
            bias,
            computed_at: new Date().toISOString(),
          },
          { onConflict: "snapshot_id" },
        );
      if (!upErr) computed++;
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
      await supabase.from("forecast_confidence_scores").upsert(
        {
          owner_id: a.owner_id,
          source: a.source,
          period_count: a.mapes.length,
          avg_mape: Math.round(avgMape * 100) / 100,
          bias_trend: biasTrend,
          confidence_score: Math.round(confidence * 100) / 100,
          computed_at: new Date().toISOString(),
        },
        { onConflict: "owner_id,source" },
      );
    }

    return new Response(JSON.stringify({ computed, scored: agg.size }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
